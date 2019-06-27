import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'


@Injectable({
  providedIn: 'root',
})
export class PlayersPageService implements OnInit{

  private corsAnywhere: string = "https://cors-anywhere.herokuapp.com/"
  private standardsURL: string = "https://www.mariokart64.com/mkdd/standardc.php"
  private usersURL: string = "https://www.mariokart64.com/mkdd/profile.php"

  userList: any = {}
  courseNamesAbbv = []
  courseNames = []

  constructor(private http: HttpClient ) { }

  ngOnInit() {}

  getStandards = () => {
    return this.http.get(this.corsAnywhere + this.standardsURL, {responseType: 'text'}).pipe(
      map((res: any) => {
        let stds = res.split("Std:").slice(1)
          .map(x => {
            return x.split("Pts:").slice(0,1)
              .map(y => {
                return y.split(">").slice(2)
                  .map(z => {
                    return z.split("<")[0]
                  })
                  .filter(y => {
                    return y.length > 1
                  })
              })[0]
          })
        let points = res.split("Pts:").slice(1)
          .map(x => {
            return x.split("</tr>").slice(0,1)
              .map(y => {
                return y.split(">").slice(2)
                  .map(z => {
                    return z.split("<")[0]
                  })
                  .filter(y => {
                    return y.length > 1
                  })
              })[0]
          })

        let rows = res.split("<td rowspan='2'>").slice(1)
        let courseNames = rows.slice(0,16).map(r => r.split("<")[0])
        this.courseNamesAbbv = courseNames
        let timeFinder = /[0-9]?\'?[0-9]?[0-9]\"[0-9][0-9]?[0-9]?/g
        let times = [...res.matchAll(timeFinder)].map(x => x[0])

        let output = {}
        courseNames.forEach((course, ci) => {
          output[course] = {
            threeLap: {},
            fastLap: {}
          }
          stds.forEach((group, gi) => {
            let passedIndices = stds.slice(0, gi).reduce((a,b) => a + b.length, 0)
            group.forEach((std, si) => {
              let fullTime = times[passedIndices + group.length*2*ci + si]
              let fullMinutes = fullTime.includes("'") ? Number(fullTime.split("'")[0]) : 0
              let fullSeconds = Number((fullTime.includes("'") ? fullTime.split("'")[1] : fullTime).split('"')[0])
              let fullMilliseconds = fullTime.split('"')[1]
              fullMilliseconds = Number(fullMilliseconds +  + "0".repeat(3 - fullMilliseconds.length))
              output[course].threeLap[std] = {
                points: points[gi][si],
                time: fullTime,
                value: fullMinutes*60 + fullSeconds + fullMilliseconds/1000
              }

              let lapTime = times[passedIndices + group.length*2*ci + group.length + si]
              let lapMinutes = lapTime.includes("'") ? Number(lapTime.split("'")[0]) : 0
              let lapSeconds = Number((lapTime.includes("'") ? lapTime.split("'")[1] : lapTime).split('"')[0])
              let lapMilliseconds = lapTime.split('"')[1]
              lapMilliseconds = Number(lapMilliseconds + "0".repeat(3 - lapMilliseconds.length))
              output[course].fastLap[std] = {
                points: points[gi][si],
                time: lapTime,
                value: lapMinutes*60 + lapSeconds + lapMilliseconds/1000
              }
            })
          })
        })
        return {courses: courseNames, standards: output}
      })
    )
  }

  getUserList = () => {
    return this.http.get(this.corsAnywhere + this.usersURL, {responseType: 'text'}).pipe(
      map(data => {
        data.split("href='profile.php?pid=").slice(1)
          .forEach(x => {
            let pid = x.split("'>")[0]
            let name = x.split("'>")[1].split("</a>")[0]
            if(!this.userList[name]){
              this.userList[name] = {
                pid: pid,
                data: null
              }
            }
          })
        return true
      })
    )
  }

  getUserData = username => {
    if(!Object.keys(this.userList).length){
      this.getUserList().subscribe(data => {
        if(this.userList[username]){
          this.parseUserData(username)
        }
        else {
          console.log("username not found in list")
        }
      })
    }
    else if(this.userList[username]){
      return this.parseUserData(username)
    }
    else {
      console.log("username not found in list")
    }
  }

  parseUserData = username => {
    if(this.userList[username].data)
      return of(this.userList[username].data)

    let address = this.corsAnywhere + this.usersURL + `?pid=${this.userList[username].pid}`
    console.log(address)
    return this.http.get(address, {responseType: 'text'}).pipe(
      map(data => {
        data = data.split("60Hz Times")[0].split("50Hz Times")[0]
        let courseNames = this.courseNames.length ? this.courseNames :
          data.split("<td rowspan='2'>").slice(1)
            .map(x => x.split(">")[1].split("<")[0])
        this.courseNames = courseNames
        this.userList[username].data = {}
        this.courseNames.forEach(c => {
          let htmlSegment = data.split(c)[1].split("<td rowspan='2'>")[0]
          if(htmlSegment.includes("<td>NT</td>")){
            this.userList[username].data[c] = null
          }
          else {
            let threeLapRow = htmlSegment.split("<tr>")[0]
            let fastLapRow = htmlSegment.split("<tr>")[1]
            let threeLapStats
            let fastLapStats
            if(threeLapRow.includes("<td>NT</td>")){
              threeLapStats = null
            }
            else {
              threeLapStats = threeLapRow.split('onmouseover="show(')[1]
                            .split(');" onmouseout="hide();')[0]
                            .split(",")
            }
            if(fastLapRow.includes("<td>NT</td>")){
              fastLapStats = null
            }
            else {
              fastLapStats = fastLapRow.split('onmouseover="show(')[1]
                            .split(');" onmouseout="hide();')[0]
                            .split(",")
            }
            this.userList[username].data[c] = {
              threeLap: threeLapStats ? {
                value: Number(threeLapStats[1]),
                rank: Number(threeLapStats[2].slice(2,-1)),
                std: threeLapStats[3].slice(1,-1),
                prsr: Number(threeLapStats[5].slice(2,-1)),
                date: threeLapStats.slice(-1)[0].slice(2,-1)
              } : null,
              fastLap: fastLapStats ? {
                value: Number(fastLapStats[1]),
                rank: Number(fastLapStats[2].slice(2,-1)),
                std: fastLapStats[3].slice(1,-1),
                prsr: Number(fastLapStats[5].slice(2,-1)),
                date: fastLapStats.slice(-1)[0].slice(2,-1)
              } : null
            }
          }
        })
        return this.userList[username].data
      })
    )
  }

  flat = arr => {
    let out = []
    arr.forEach(a => out = [...out, ...a])
    return out
  }


}
