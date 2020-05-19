import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators'
import { Observable, of } from 'rxjs'


@Injectable({
  providedIn: 'root',
})
export class PlayersPageService implements OnInit{

  //use the cors anywhere link for local testing. use the aqueous-anchorage link when building for production
  private corsAnywhere: string = "https://aqueous-anchorage-29772.herokuapp.com/"//"https://cors-anywhere.herokuapp.com/"//
  private standardsURL: string = "https://www.mariokart64.com/mkdd/standardc.php"
  private usersURL: string = "https://www.mariokart64.com/mkdd/profile.php"
  private wrsURL: string = "https://www.mariokart64.com/mkdd/wrc.php"
  private leaderboardURL: string = "https://www.mariokart64.com/mkdd/coursec.php?cid="
  private overallRankURL: string = "https://www.mariokart64.com/mkdd/afc.php?cfilter=&full=on"
  private submitURL: string = "http://www.mariokart64.com/cgi-bin/yabb2/YaBB.pl?num=1571543717;action=post2"//"http://snorge.wrvids.com/mkdd/email.php"

  //to submit, you have to post data like the following:
  //0=1%2717%22308&1=&2=&3=&4=&5=&6=&7=&8=&9=&10=&11=&12=&13=&14=&15=&16=&17=&18=&19=&20=&21=&22=&23=&24=&25=&26=&27=&28=&29=&30=&31=&message=Sorry+about+this+fake+submission%2C+was+testing+something.+Please+ignore.&name=Daniel+Baamonde
  //to here http://snorge.wrvids.com/mkdd/email.php
  //not sure about headers, maybe these:
  //Content-Length: number of characters after url encoding
  //Content-Type: application/x-www-form-urlencoded
  //for new players its like this newname=&country=&region=&addy=&hertz=sixty&0=&1=&2=&3=&4=&5=&6=&7=&8=&9=&10=&11=&12=&13=&14=&15=&16=&17=&18=&19=&20=&21=&22=&23=&24=&25=&26=&27=&28=&29=&30=&31=&message=&name=Scott+Abbey
  userList: any = {};
  courseNamesAbbv = [];
  courseNames = [];
  wrs = [];
  leaderboards = [];
  username: string = "";
  afs = [];

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
                data: null,
                rank: 9999
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
          let htmlSegment = data.split(c)[1].split("<td rowspan='2'>")[0];
          let newbieData = {
            value: 599.99,
            rank: 9999,
            std: "Newbie",
            prsr: 0,
            date: this.formatDate(new Date()),
            time: `9'59"99`,
            points: 31
          }
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
            } : newbieData,
            fastLap: fastLapStats ? {
              value: Number(fastLapStats[1]),
              rank: Number(fastLapStats[2].slice(2,-1)),
              std: fastLapStats[3].slice(1,-1),
              prsr: Number(fastLapStats[5].slice(2,-1)),
              date: fastLapStats.slice(-1)[0].slice(2,-1).split("'")[0],
              time: fastLapRow.split(";'>")[1].split("<")[0],
              points: Number(fastLapRow.split(" / ")[0].slice(-6).split(">")[1])
            } : newbieData
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

  getRank = (courseId, value, rowNode, field, oldValue, changeDebouncer) => {
    if(this.leaderboards[courseId].length){
      if(field ==="rank"){
        //incoming value is new inputted time
        let newRank = (this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(value)) + 1) || (this.leaderboards[courseId].length + 1)
        if(newRank !== rowNode.data["rank"] && !changeDebouncer.includes(field)) rowNode.setDataValue(field, newRank)
      }
      else if(field === "goal-rank"){
        //incoming value is new inputted goal-time
        let newRank = (this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(value)) + 1) || (this.leaderboards[courseId].length + 1)
        if(newRank !== rowNode.data["goal-rank"] && !changeDebouncer.includes(field)) rowNode.setDataValue(field, newRank)

        let newTimeLeft = this.valueConverter(this.timeConverter(rowNode.data.time) - this.timeConverter(rowNode.data["goal-time"]))
        newTimeLeft = (newTimeLeft[0] === "-" || newTimeLeft === '0"0') ? '0"000' : newTimeLeft
        if(newTimeLeft !== rowNode.data["time-to-go"]) rowNode.setDataValue("time-to-go", newTimeLeft)
      }
      else if(field === "goal-time"){
        //incoming value is new inputted goal-rank, but first make sure that rank isnt larger than the lb size
        let time
        if(value > this.leaderboards[courseId].length){
          time = this.leaderboards[courseId].slice(-1)[0]

          let newRank = this.leaderboards[courseId].length + 1
          if(newRank !== rowNode.data["goal-rank"]) rowNode.setDataValue("goal-rank", newRank)
        } else {
          time = this.leaderboards[courseId][value-1]
        }
        while(!Number(time[0])){
          time = time.slice(1)
        }
        //if the goal time corresponding to the incoming inputted goal rank is different from the existing goal time AND
        //the change debouncer doesnt indicate that goal time has been changed very recently
        //either: a:(there was already a goal rank which is different from the inputted one) OR b:(there was not already a goal time)
        //clause "a" prevents infinite change propagation since goal time changes goal rank and vice versa
        //clause b ensures the change can propagate once
        if(time !== rowNode.data["goal-time"] && !changeDebouncer.includes(field) && ((oldValue && oldValue !== value) || (!rowNode.data["goal-time"]))) {
          rowNode.setDataValue(field, time)

          let newTimeLeft = this.valueConverter(this.timeConverter(rowNode.data.time) - this.timeConverter(rowNode.data["goal-time"]))
          newTimeLeft = (newTimeLeft[0] === "-" || newTimeLeft === '0"0') ? '0"000' : newTimeLeft
          if(newTimeLeft !== rowNode.data["time-to-go"]) rowNode.setDataValue("time-to-go", newTimeLeft)
        }
      }
      this.setLocalStorage(rowNode.data)
    }
    else {
      this.getLeaderboard(courseId, rowNode, value, field, oldValue, changeDebouncer)
    }
  }

  getLeaderboard = (courseId, rowNode, value, field, oldValue, changeDebouncer, start = 1, recursive = true) => {
    let address = this.corsAnywhere + this.leaderboardURL + courseId + (start > 1 ? "&start=" + start : "")
    this.http.get(address, {responseType: 'text'}).pipe(
      map((res: any) => {
        let leaderboardSize = Number(res.split("Showing results")[1].split(" / ")[1].split("</b>")[0])
        let timeFinder = /[0-9]?\'?[0-9]?[0-9]\"[0-9][0-9]?[0-9]?/g
        let times = [...res.matchAll(timeFinder)].map(x => x[0])
        this.leaderboards[courseId] = [...this.leaderboards[courseId], ...times]
        if(recursive){
          for(let start = 101; start <= leaderboardSize; start=start+100){
            this.getLeaderboard(courseId, rowNode, value, field, oldValue, changeDebouncer, start, false)
          }
          return false
        }
        else if(this.leaderboards[courseId].length === leaderboardSize){
          this.leaderboards[courseId].sort((a,b) => this.timeConverter(a) - this.timeConverter(b))
          if(field ==="rank"){
            //incoming value is new inputted time
            let newRank = (this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(value)) + 1) || (this.leaderboards[courseId].length + 1)
            if(newRank !== rowNode.data["rank"] && !changeDebouncer.includes(field)) rowNode.setDataValue(field, newRank)
          }
          else if(field === "goal-rank"){
            //incoming value is new inputted goal-time
            let newRank = (this.leaderboards[courseId].findIndex(x => this.timeConverter(x) >= this.timeConverter(value)) + 1) || (this.leaderboards[courseId].length + 1)
            if(newRank !== rowNode.data["goal-rank"] && !changeDebouncer.includes(field)) rowNode.setDataValue(field, newRank)

            let newTimeLeft = this.valueConverter(this.timeConverter(rowNode.data.time) - this.timeConverter(rowNode.data["goal-time"]))
            newTimeLeft = (newTimeLeft[0] === "-" || newTimeLeft === '0"0') ? '0"000' : newTimeLeft
            if(newTimeLeft !== rowNode.data["time-to-go"]) rowNode.setDataValue("time-to-go", newTimeLeft)
          }
          else if(field === "goal-time"){
            //incoming value is new inputted goal-rank, but first make sure that rank isnt larger than the lb size
            let time
            if(value > this.leaderboards[courseId].length){
              time = this.leaderboards[courseId].slice(-1)[0]

              let newRank = this.leaderboards[courseId].length + 1
              if(newRank !== rowNode.data["goal-rank"]) rowNode.setDataValue("goal-rank", newRank)
            } else {
              time = this.leaderboards[courseId][value-1]
            }
            while(!Number(time[0])){
              time = time.slice(1)
            }
            //if the goal time corresponding to the incoming inputted goal rank is different from the existing goal time AND
            //the change debouncer doesnt indicate that goal time has been changed very recently
            //either: a:(there was already a goal rank which is different from the inputted one) OR b:(there was not already a goal time)
            //clause "a" prevents infinite change propagation since goal time changes goal rank and vice versa
            //clause b ensures the change can propagate once
            if(time !== rowNode.data["goal-time"] && !changeDebouncer.includes(field) && ((oldValue && oldValue !== value) || (!rowNode.data["goal-time"]))){
              rowNode.setDataValue(field, time)

              let newTimeLeft = this.valueConverter(this.timeConverter(rowNode.data.time) - this.timeConverter(time))
              newTimeLeft = (newTimeLeft[0] === "-" || newTimeLeft === '0"0') ? '0"000' : newTimeLeft
              if(newTimeLeft !== rowNode.data["time-to-go"] && oldValue && oldValue !== value) rowNode.setDataValue("time-to-go", newTimeLeft)
            }
          }
          return rowNode.data
        }
        else {
          return false
        }
      })
    ).subscribe((response) => {
      if(!response) return;
      this.setLocalStorage(response)
    })
  }

  getRankByAf = af => this.afs.findIndex(x => x >= af) + 1 || this.afs.length + 1

  getOverallRanks = () => {
    return this.http.get(this.corsAnywhere + this.overallRankURL, {responseType: 'text'}).pipe(
      map((res: any) => {
        let rows = res.split("checked=")[1].split("<tr>").slice(2)
        rows.forEach(row => {
          let username = row.split("<td>")[2].split("</td>")[0]
          let rank = row.split("<td>")[1].split("</td>")[0]
          this.afs.push(Number(row.split("<td>")[6].split("</td>")[0]))
          this.userList[username]["rank"] = Number(rank)
        })
      })
    )
  }

  setLocalStorage = (rowData = null, ignoreOld = false) => {
    let data: any = this.getLocalStorage()
    let obj = {
      username: this.username,
    }
    if(rowData && rowData.id) {
      obj[`${rowData.id}`] = rowData
    }
    if(data.username === this.username && !ignoreOld){
      obj = Object.assign(data, obj)
    }
    window.localStorage.setItem("mkdd--userData", JSON.stringify(obj))
  }

  postSubmission = (data, subHistory, username) => {
    let address = this.corsAnywhere + this.submitURL
    let headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    headers.append('Cookie', 'Y2User-28901=dbaamonde21892; Y2Sess-28901=iJ7L5HAFZ4qz1qWPqUpy/A; Y2Pass-28901=/qtlSSpQv0cCtToaW//eIQ');
    console.log(new HttpHeaders().set('Cookie', 'Y2User-28901=dbaamonde21892; Y2Sess-28901=iJ7L5HAFZ4qz1qWPqUpy/A; Y2Pass-28901=/qtlSSpQv0cCtToaW//eIQ'))
    let options: any = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'Y2User-28901=dbaamonde21892; Y2Sess-28901=iJ7L5HAFZ4qz1qWPqUpy/A; Y2Pass-28901=/qtlSSpQv0cCtToaW//eIQ'
        },
        responseType: 'text'
    };
    if(!username){
      alert("Invalid Username")
    }
    else {
      this.http.post(address, data, options).subscribe(
        (x: any) => {
          debugger;
          if(x.includes("Message successfully sent!")){
            alert("Times successfully submitted!")
            window.localStorage.setItem("mkdd--submissions", JSON.stringify(subHistory))
          }
          else{
            alert("Could not submit times. Try again later, and if the issue persists, contact dannyb21892!")
          }
        }
      )
    }
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

  valueConverter = (val) => {
    val = Math.round(val*1000)/1000 //round to nearest thousandth to prevent floating point inaccuracy
    let minutes = Math.floor(val/60)
    let seconds = Math.floor(val - 60*minutes)
    let milliseconds: any = Math.round(1000*(val - Math.floor(val)))
    let out = minutes ? `${minutes}'` : ""
    out += seconds === 0 ? (minutes ? '00"' : '0"') : (seconds < 10 ? (minutes ? `0${seconds}"` : `${seconds}"`) : `${seconds}"`)
    milliseconds = milliseconds === 0 ? '0' : (milliseconds < 10 ? `00${milliseconds}` : (milliseconds < 100 ? `0${milliseconds}` : `${milliseconds}`))
    while(milliseconds.length > 1 && milliseconds.slice(-1)==="0"){
      milliseconds = milliseconds.slice(0,-1)
    }
    return out + milliseconds
  }

  formatDate = date => `${date.getFullYear()}-${(date.getMonth() < 9 ? "0" : "") + (date.getMonth()+1)}-${(date.getDay() < 10 ? "0" : "") + date.getDay()}`

}
