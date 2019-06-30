import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'standards-grid',
  templateUrl: './standards-grid.component.html',
  styleUrls: ['./standards-grid.component.scss']
})
export class StandardsGrid implements OnInit, OnChanges {

  @Input() standards: any;
  @Input() wrs: any;
  @Input() userData: any;

  columnDefs = [];
  rowData = [];
  points = {};

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
      console.log(changes)
      if(key === "standards" && this.wrs && this.userData){
        this.setStandards()
      } else if(key !== "standards"){
        this[`set${this.capitalize(key)}`]()
      }
    })
  }

  setStandards = () => {
    this.columnDefs = [];
    this.rowData = [];
    if(!this.standards) return

    let allBuckets = Object.keys(this.standards.standards[Object.keys(this.standards.standards)[0]].fastLap)
    let headers = [...new Set(allBuckets.map(k => k.split(" ")[0].split("+")[0]))]

    this.columnDefs = [{
      headerName: "Course",
      field: "course",
      rowSpan: function(params) {
        return 2;
      },
      width: 65,
      cellClassRules: { "cell-span": "value.length > 0", "cell-course-border": "value !== 'LC'", "cell-data-border": "true"},
      cellStyle: {"text-align": 'center', 'line-height': 3.5, "font-size": '16px'}
    },{
      headerName: "Trial",
      field: "trial",
      width: 60,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"}
    },{
      headerName: "User Data",
      children: [{
        headerName: "PR",
        field: "time",
        width: 80,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      },{
        headerName: "Points",
        field: "points",
        width: 60,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      },{
        headerName: "Standard",
        field: "std",
        width: 80,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      },{
        headerName: "Rank",
        field: "rank",
        width: 60,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      },{
        headerName: "PRSR",
        field: "prsr",
        width: 60,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      },{
        headerName: "Date",
        field: "date",
        width: 100,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"}
      }]
    }]

    headers.forEach(h => {
      let children = allBuckets.filter(b => b.includes(h))
      if(h === "God")
        children.sort((a,b) => Number(b.split("+")[1]) - Number(a.split("+")[1]))
      else {
        children.sort()
        if(children.slice(-1)[0].includes("+"))
          children = [...children.slice(-1), ...children.slice(0,-1)]
      }

      children.forEach(c => {
        this.points[c] = this.standards.standards[Object.keys(this.standards.standards)[0]].fastLap[c].points
      })

      let colDef = {
        headerName: h,
        children: children.map(c => {
          return {
            headerName: c + " (" + this.points[c] + ")",
            field: c,
            width: 100,
            cellStyle: {"text-align": 'center'},
            cellClassRules: { "cell-data-border": "true",
                              "wr-time": (params) => {return this.wrSelector(params)},
                              "pr-time": (params) => {return this.prSelector(params)},
                            }
            }
        })
      }

      this.columnDefs.push(colDef)
    })

    this.standards.courses.forEach(course => {
      let row1 = {
        course: course,
        trial: "3-lap",
      }
      let row2 = {
        course: "",
        trial: "f-lap",
      }

      Object.assign(row1, this.userData[course]["threeLap"])
      Object.assign(row2, this.userData[course]["fastLap"])

      row1["time"] = this.valueConverter(this.userData[course]["threeLap"].value)
      row2["time"] = this.valueConverter(this.userData[course]["fastLap"].value)

      allBuckets.forEach(b => {
        row1[b] = this.standards.standards[course].threeLap[b].time
        row2[b] = this.standards.standards[course].fastLap[b].time
      })
      this.rowData.push(row1)
      this.rowData.push(row2)
    })

  }

  setWrs = () => {
    if(this.userData) this.setStandards()
  }

  wrSelector = params => {
    let row = params.rowIndex
    let wr = this.timeConverter(this.wrs[row])
    let rowTimes = Object.entries(params.data).map(keyVal => {
      if(!Object.keys(this.points).includes(keyVal[0])) return null

      let out: any[] = [keyVal[1], this.timeConverter(keyVal[1])]
      return out
    })
    .filter(x => x && x[1] >= wr)
    return params.value === rowTimes[0][0]
  }

  prSelector = params => {
    let row = params.rowIndex
    let pr = this.timeConverter(params.data.time)
    let rowTimes = Object.entries(params.data).map(keyVal => {
      if(!Object.keys(this.points).includes(keyVal[0])) return null

      return [keyVal[1], this.timeConverter(keyVal[1])]
    })
    .filter(x => x && x[1] >= pr)
    return params.value === rowTimes[0][0]
  }

  setUserData = () => {
    if(this.wrs) this.setStandards()
  }

  capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

  timeConverter = (time) => {
    let minutes = time.includes("'") ? Number(time.split("'")[0]) : 0
    let seconds = Number((time.includes("'") ? time.split("'")[1] : time).split('"')[0])
    let milliseconds: any = time.split('"')[1]
    milliseconds = Number(milliseconds + "0".repeat(3 - milliseconds.length))
    let value: any = minutes*60 + seconds + milliseconds/1000
    return value
  }

  valueConverter = (val) => {
    let minutes = Math.floor(val/60)
    let seconds = Math.floor(val - 60*minutes)
    let milliseconds: any = Math.ceil(1000*(val - Math.floor(val)))
    let out = minutes ? `${minutes}'` : ""
    out += seconds === 0 ? '00"' : (seconds < 10 ? `0${seconds}"` : `${seconds}"`)
    milliseconds = milliseconds === 0 ? '0' : (milliseconds < 10 ? `00${milliseconds}` : (milliseconds < 100 ? `0${milliseconds}` : `${milliseconds}`))
    while(milliseconds.length > 1 && milliseconds.slice(-1)==="0"){
      milliseconds = milliseconds.slice(0,-1)
    }
    return out + milliseconds
  }

  flatten = arr => {
    let out = []
    arr.forEach(x => {
      if(typeof(x) !== "object") return

      out = [...out, ...x]
    })
    return out
  }

}
