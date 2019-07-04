import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { CellEditorComponent } from "./cell-editor.component"
import { PlayersPageService } from 'src/app/services/players-page.service';

@Component({
  selector: 'standards-grid',
  templateUrl: './standards-grid.component.html',
  styleUrls: ['./standards-grid.component.scss']
})
export class StandardsGrid implements OnInit, OnChanges {

  @Input() standards: any;
  @Input() wrs: any;
  @Input() userData: any;
  @Input() username: any;
  @Input() dumbChangeDetector: any;

  localUserData: any = null;

  columnDefs = [];
  rowData = [];
  points = {};

  gridApi;
  gridColumnApi;

  gridLoadedFirstTime = false;

  constructor(private pps: PlayersPageService) {}

  ngOnInit() {
    this.localUserData = this.pps.getLocalStorage();
  }

  ngOnChanges(changes: SimpleChanges) {
    Object.keys(changes).forEach(key => {
      this[key] = Object.assign({}, changes[key].currentValue)
      console.log(changes)
      if(key === "standards" && this.wrs && this.userData && Object.keys(this.userData).length){
        console.log("setting standards from onchanges")
        this.setStandards()
      } else if(key !== "standards"){
        this[`set${this.capitalize(key)}`]()
      }
    })
  }

  setStandards = () => {
    this.columnDefs = this.defaultColDefs;
    this.rowData = [];
    if(!this.standards) return

    let allBuckets = Object.keys(this.standards.standards[Object.keys(this.standards.standards)[0]].fastLap)
    let headers = [...new Set(allBuckets.map(k => k.split(" ")[0].split("+")[0]))]

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
      let id1 = course + "3"
      let id2 = course + "f"
      let row1
      let row2
      if(this.localUserData.username === this.username && this.localUserData[id1]) {
        row1 = this.localUserData[id1]
      }
      else {
        row1 = this.initializeRow(id1, allBuckets)
      }
      if(this.localUserData.username === this.username && this.localUserData[id2]) {
        row2 = this.localUserData[id2]
      }
      else {
        row2 = this.initializeRow(id2, allBuckets)
      }

      this.rowData.push(row1)
      this.rowData.push(row2)
    })
    this.gridLoadedFirstTime = true;
    this.rowData = [...this.rowData]//trigger change detection for average stats child
  }

  initializeRow = (id, allBuckets) => {
    let course = id.slice(0,-1)
    let trial = id.slice(-1) === "3" ? "threeLap" : "fastLap"
    let row = {
      id: id,
      course: id.slice(-1) === "3" ? course : "",
      trial: id.slice(-1) === "3" ? "3-lap" : "f-lap",
    }
    row = Object.assign(row, this.userData[course][trial])
    row["prsr"] = row["prsr"] + "%"
    allBuckets.forEach(b => {
      row[b] = this.standards.standards[course][trial][b].time
    })
    return row
  }

  setWrs = () => {
    if(this.userData && Object.keys(this.userData).length) this.setStandards()
  }

  wrSelector = params => {
    let row = params.rowIndex
    let wr = this.timeConverter(this.wrs[row])
    let rowTimes = Object.entries(params.data).map(keyVal => {
      if(!Object.keys(this.points).includes(keyVal[0])) return null

      let out: any[] = [keyVal[1], this.timeConverter(keyVal[1])]
      return out
    })
    .filter(x => x && x[1] > wr)
    return params.value === rowTimes[0][0]
  }

  prSelector = params => {
    let row = params.rowIndex
    let pr = this.timeConverter(params.data.time)
    let rowTimes = Object.entries(params.data).map(keyVal => {
      if(!Object.keys(this.points).includes(keyVal[0])) return null

      return [keyVal[1], this.timeConverter(keyVal[1])]
    })
    .filter(x => x && x[1] > pr)
    return params.value === rowTimes[0][0]
  }

  setUserData = () => {
    this.localUserData = this.pps.getLocalStorage();
    if(Object.keys(this.userData).length) {
      this.username = this.pps.getUsername();
      if(this.wrs) this.setStandards();
    }
  }

  setUsername = () => {}

  onCellChanged = event => {
    if(event.colDef.field !== "time") return;
    let course = event.data.course;
    let trial = event.data.trial === "3-lap" ? "threeLap" : "fastLap"
    let rowNode = event.node;
    rowNode.setDataValue("date", this.formatDate(new Date()))
    let standardAndPoints = this.getStandardAndPointsFromTime(event.newValue, rowNode)
    rowNode.setDataValue("std", standardAndPoints.standard)
    rowNode.setDataValue("points", Math.round(standardAndPoints.points))
    rowNode.setDataValue("prsr", (Math.round(10000 * this.timeConverter(this.wrs[event.rowIndex]) / this.timeConverter(event.newValue)) / 100) + "%")
    this.pps.getRank(event.rowIndex, event.newValue, rowNode)
    this.rowData = [...this.rowData]
  }

  getStandardAndPointsFromTime = (time, row) => {
    let value = this.timeConverter(time)
    let values = Object.entries(row.data)
      .filter(keyVal => !["course", "date", "id", "points", "prsr", "rank", "std", "time", "trial", "value"].includes(keyVal[0]))
      .map(keyVal => {return [keyVal[0], this.timeConverter(keyVal[1])]})
      .sort((a,b) => a[1] - b[1])
    let pair = values.find(pair => pair[1] > value)
    return {points: this.points[pair[0]], standard: pair[0]}
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

  formatDate = date => `${date.getFullYear()}-${(date.getMonth() < 9 ? "0" : "") + (date.getMonth()+1)}-${(date.getDay() < 10 ? "0" : "") + date.getDay()}`

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  getRowNodeId = function(data) {
    return data.id;
  };

  setDumbChangeDetector = () => {
    if(this.gridLoadedFirstTime){
      this.localUserData = this.pps.getLocalStorage();
      this.setStandards();
    }
  }

  defaultColDefs = [{
    headerName: "Course",
    field: "course",
    rowSpan: function(params) {
      return params.data.course === "" ? 1 : 2
    },
    width: 65,
    cellClassRules: { "cell-span": "value.length > 0", "cell-course-border": "value !== 'LC'", "cell-data-border": "true"},
    cellStyle: {"text-align": 'center', 'line-height': 3.5, "font-size": '16px'},
    pinned: 'left',
    //lockPosition: true
  },{
    headerName: "Trial",
    field: "trial",
    width: 60,
    cellStyle: {"background-color": "#1c1f20", "text-align": 'center'},
    cellClassRules: { "cell-data-border": "true"},
    pinned: 'left',
    //lockPosition: true
  },{
    headerName: "User Data",
    marryChildren: true,
    children: [{
      headerName: "PR",
      field: "time",
      width: 80,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      cellEditorFramework: CellEditorComponent,
      editable: true,
      pinned: 'left',
    },{
      headerName: "Points",
      field: "points",
      colId: "points",
      width: 60,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      pinned: 'left',
    },{
      headerName: "Standard",
      field: "std",
      colId: "std",
      width: 110,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      pinned: 'left',
    },{
      headerName: "Rank",
      field: "rank",
      colId: "rank",
      width: 60,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      pinned: 'left',
    },{
      headerName: "PRSR",
      field: "prsr",
      colId: "prsr",
      width: 65,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      pinned: 'left',
    },{
      headerName: "Date",
      field: "date",
      colId: "date",
      width: 100,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
      pinned: 'left',
    }]
  }]
}
