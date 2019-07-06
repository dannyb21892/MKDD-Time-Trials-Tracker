import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators'
import { of } from 'rxjs'


@Injectable({
  providedIn: 'root',
})
export class PlayersPageService implements OnInit{

  private corsAnywhere: string = "https://cors-anywhere.herokuapp.com/"//"https://aqueous-anchorage-29772.herokuapp.com/"//
  private standardsURL: string = "https://www.mariokart64.com/mkdd/standardc.php"
  private usersURL: string = "https://www.mariokart64.com/mkdd/profile.php"
  private wrsURL: string = "https://www.mariokart64.com/mkdd/wrc.php"
  private leaderboardURL: string = "https://www.mariokart64.com/mkdd/coursec.php?cid="

  userList: any = {};
  courseNamesAbbv = [];
  courseNames = [];
  wrs = [];
  leaderboards = [];
  username: string = "";

  constructor(private http: HttpClient) {
    for(let i=0; i<32; i++){
      this.leaderboards.push([])
    }
  }

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
        let unorderedTimes = [...res.matchAll(timeFinder)].map(x => x[0])
        let times = []
        for(let trial = 0; trial < 32; trial++){
          stds.forEach((group, gi) => {
            let offset = gi === stds.length - 1 ? trial : 0
            let passedIndices = stds.slice(0, gi).reduce((a,b) => a + b.length, 0)
            let additional = unorderedTimes.slice(32*passedIndices + trial*group.length - offset, 32*passedIndices + (trial + 1)*group.length - offset)
            if(gi === stds.length - 1){
              if(trial < 31) additional = additional.slice(0,-1) //cut off newbie time
              additional.push(`9'59"999`)
            }
            times = [...times, ...additional]
          })
        }
        let output = {}
        let numStandards = stds.reduce((a,b) => a + b.length, 0)
        courseNames.forEach((course, ci) => {
          output[course] = {
            threeLap: {},
            fastLap: {}
          }
          stds.forEach((group, gi) => {
            let passedIndices = stds.slice(0, gi).reduce((a,b) => a + b.length, 0)
            group.forEach((std, si) => {
              let fullTime = times[numStandards*2*ci + passedIndices + si]
              let fullMinutes = fullTime.includes("'") ? Number(fullTime.split("'")[0]) : 0
              let fullSeconds = Number((fullTime.includes("'") ? fullTime.split("'")[1] : fullTime).split('"')[0])
              let fullMilliseconds = fullTime.split('"')[1]
              fullMilliseconds = Number(fullMilliseconds + "0".repeat(3 - fullMilliseconds.length))
              output[course].threeLap[std] = {
                points: points[gi][si],
                time: fullTime,
                value: fullMinutes*60 + fullSeconds + fullMilliseconds/1000
              }

              let lapTime = times[numStandards*(2*ci + 1) + passedIndices + si]
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

  getUserData = (username, clearLocal=false) => {
    if(!Object.keys(this.userList).length){
      this.getUserList().subscribe(data => {
        if(this.userList[username]){
          this.parseUserData(username, clearLocal)
        }
        else {
          return this.getBlankTimes(username)
        }
      })
    }
    else if(this.userList[username]){
      return this.parseUserData(username, clearLocal)
    }
    else {
      return this.getBlankTimes(username)
    }
  }

  getBlankTimes = username => {
    this.username = username
    let loc = this.getLocalStorage()
    if(loc.username !== username) this.setLocalStorage()
    let userObj = {}
    this.courseNamesAbbv.forEach(c => {
      userObj[c] = {
        threeLap: {
          value: 599.99,
          rank: 9999,
          std: "Newbie",
          prsr: 0,
          date: this.formatDate(new Date()),
          time: `9'59"99`,
          points: 31
        },
        fastLap: {
          value: 599.99,
          rank: 9999,
          std: "Newbie",
          prsr: 0,
          date: this.formatDate(new Date()),
          time: `9'59"99`,
          points: 31
        }
      }
    })
    return of(userObj)
  }

  parseUserData = (username, clearLocal=false) => {
    this.username = username
    if(clearLocal) this.setLocalStorage(null)
    if(this.userList[username].data)
      return of(this.userList[username].data)

    let address = this.corsAnywhere + this.usersURL + `?pid=${this.userList[username].pid}`
    return this.http.get(address, {responseType: 'text'}).pipe(
      map(data => {
        data = data.split("60Hz Times")[0].split("50Hz Times")[0]
        let courseNames = this.courseNames.length ? this.courseNames :
          data.split("<td rowspan='2'>").slice(1)
            .map(x => x.split(">")[1].split("<")[0])
        this.courseNames = courseNames
        this.userList[username].data = {}
        this.courseNames.forEach((c, ci) => {
          let htmlSegment = data.split(c)[1].split("<td rowspan='2'>")[0]
          if(htmlSegment.includes("<td>NT</td>")){
            this.userList[username].data[this.courseNamesAbbv[ci]] = {
              threeLap: {
                value: 599.99,
                rank: 9999,
                std: "Newbie",
                prsr: 0,
                date: this.formatDate(new Date()),
                time: `9'59"99`,
                points: 31
              },
              fastLap: {
                value: 599.99,
                rank: 9999,
                std: "Newbie",
                prsr: 0,
                date: this.formatDate(new Date()),
                time: `9'59"99`,
                points: 31
              }
            }
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
            this.userList[username].data[this.courseNamesAbbv[ci]] = {
              threeLap: threeLapStats ? {
                value: Number(threeLapStats[1]),
                rank: Number(threeLapStats[2].slice(2,-1)),
                std: threeLapStats[3].slice(1,-1),
                prsr: Number(threeLapStats[5].slice(2,-1)),
                date: threeLapStats.slice(-1)[0].slice(2,-1).split("'")[0],
                time: threeLapRow.split(";'>")[1].split("<")[0],
                points: Number(threeLapRow.split(" / ")[0].slice(-6).split(">")[1])
              } : null,
              fastLap: fastLapStats ? {
                value: Number(fastLapStats[1]),
                rank: Number(fastLapStats[2].slice(2,-1)),
                std: fastLapStats[3].slice(1,-1),
                prsr: Number(fastLapStats[5].slice(2,-1)),
                date: fastLapStats.slice(-1)[0].slice(2,-1).split("'")[0],
                time: fastLapRow.split(";'>")[1].split("<")[0],
                points: Number(fastLapRow.split(" / ")[0].slice(-6).split(">")[1])
              } : null
            }
          }
        })
        return this.userList[username].data
      })
    )
  }

  getWRs = () => {
    if(this.wrs.length === 32)
      return of(this.wrs)

    let address = this.corsAnywhere + this.wrsURL
    return this.http.get(address, {responseType: 'text'}).pipe(
      map((res: any) => {
        let timeFinder = /[0-9]?\'?[0-9]?[0-9]\"[0-9][0-9]?[0-9]?/g
        this.wrs = [...res.matchAll(timeFinder)].slice(0,32).map(x => x[0])
        return this.wrs
      })
    )
  }

  getRank = (courseId, time, rowNode) => {
    if(this.leaderboards[courseId].length){
      rowNode.setDataValue("rank", this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(time)) + 1)
      this.setLocalStorage(rowNode.data)
    }
    else {
      this.getLeaderboard(courseId, rowNode, time)
    }
  }

  getLeaderboard = (courseId, rowNode, time, start = 1, recursive = true) => {
    let address = this.corsAnywhere + this.leaderboardURL + courseId + (start > 1 ? "&start=" + start : "")
    this.http.get(address, {responseType: 'text'}).pipe(
      map((res: any) => {
        let leaderboardSize = Number(res.split("Showing results")[1].split(" / ")[1].split("</b>")[0])
        let timeFinder = /[0-9]?\'?[0-9]?[0-9]\"[0-9][0-9]?[0-9]?/g
        let times = [...res.matchAll(timeFinder)].map(x => x[0])
        this.leaderboards[courseId] = [...this.leaderboards[courseId], ...times]
        if(recursive){
          for(let start = 101; start <= leaderboardSize; start=start+100){
            this.getLeaderboard(courseId, rowNode, time, start, false)
          }
          return false
        }
        else if(this.leaderboards[courseId].length === leaderboardSize){
          this.leaderboards[courseId].sort((a,b) => this.timeConverter(a) - this.timeConverter(b))
          rowNode.setDataValue("rank", (this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(time)) + 1) || this.leaderboards[courseId].length + 1)
          return rowNode.data
        }
        else {
          return false
        }
      })
    ).subscribe((response) => {
      if(!response) return;
      console.log(response)
      this.setLocalStorage(response)
    })
  }

  setLocalStorage = (rowData = null) => {
    let data: any = this.getLocalStorage()
    console.log(data)
    let obj = {
      username: this.username,
    }
    if(rowData && rowData.id) {
      obj[`${rowData.id}`] = rowData
      if(data.username === this.username){
        obj = Object.assign(data, obj)
      }
    }
    console.log(obj)
    window.localStorage.setItem("mkdd--userData", JSON.stringify(obj))
  }

  getLocalStorage = () => {return JSON.parse(window.localStorage.getItem("mkdd--userData")) || {}}

  getUsername = () => this.username

  flat = arr => {
    let out = []
    arr.forEach(a => out = [...out, ...a])
    return out
  }

  timeConverter = (time) => {
    let minutes = time.includes("'") ? Number(time.split("'")[0]) : 0
    let seconds = Number((time.includes("'") ? time.split("'")[1] : time).split('"')[0])
    let milliseconds: any = time.split('"')[1]
    milliseconds = Number(milliseconds + "0".repeat(3 - milliseconds.length))
    let value: any = minutes*60 + seconds + milliseconds/1000
    return value
  }

  formatDate = date => `${date.getFullYear()}-${(date.getMonth() < 9 ? "0" : "") + (date.getMonth()+1)}-${(date.getDay() < 10 ? "0" : "") + date.getDay()}`

}
