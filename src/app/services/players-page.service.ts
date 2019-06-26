import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators'


@Injectable({
  providedIn: 'root',
})
export class PlayersPageService implements OnInit{

  private corsAnywhere: string = "https://cors-anywhere.herokuapp.com/"
  private standardsURL: string = "https://www.mariokart64.com/mkdd/standardc.php"

  constructor(private http: HttpClient ) { }

  ngOnInit() {}

  getStandards = () => {
    let response = this.http.get(this.corsAnywhere + this.standardsURL, {responseType: 'text'}).pipe(
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
    return response
  }

  flat = arr => {
    let out = []
    arr.forEach(a => out = [...out, ...a])
    return out
  }


}
