import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';

@Component({
  selector: 'overall-stats',
  templateUrl: './overall-stats.component.html',
})
export class OverallStats implements OnInit, OnChanges {

  @Input() parentRowData: any;
  @Input() pointMap: any;

  rowData = [];

  nameMap = {
    Expert: "Exp",
    Advanced: "Adv",
    Intermediate: "Int",
    Beginner: "Beg"
  }

  gridApi;
  gridColumnApi;

  gridLoadedFirstTime = false;

  constructor(private pps: PlayersPageService) {}

  ngOnInit() {}

  ngOnChanges(params) {
    if(this.parentRowData && Object.keys(this.pointMap).length)
      this.calculateStats()

  }

  calculateStats = () => {
    this.rowData = [];

    let row = {}

    let nonStdCols = ["id", "course", "time", "date", "prsr", "rank", "std", "points", "trial", "value"]

    let points = this.parentRowData.map(r => r.points)
    row["points"] = points.length ? Math.round(100*points.reduce((a,b) => a + Number(b), 0)/points.length)/100 : "N/A"

    let ranks = this.parentRowData.map(r => r.rank)
    row["af"] = ranks.length ? Math.round(ranks.reduce((a,b) => a + Number(b), 0)/ranks.length) : "N/A"

    let prsrs = this.parentRowData.map(r => r.prsr)
    row["prsr"] = prsrs.length ? (Math.round(100*prsrs.reduce((a,b) => a + Number(b.slice(0,-1)), 0)/prsrs.length)/100) + "%" : "N/A"

    let pointPairs = Object.entries(this.pointMap).sort((a,b) => Number(a[1]) - Number(b[1]))
    let std = pointPairs.find(x => x[1] > row["points"])
    row["std"] = std ? std[0] : "Newbie"

    let bestPrsr = Math.max(...this.parentRowData.map(r => Number(r.prsr.slice(0,-1))))
    let bestPrsrRow = this.parentRowData.find(r => Number(r.prsr.slice(0,-1)) === bestPrsr)
    row["best-prsr"] = bestPrsrRow["id"].slice(0,-1) + " " + bestPrsrRow["id"].slice(-1) + "-lap (" + bestPrsr + "%)"

    let bestRank = Math.min(...this.parentRowData.map(r => r["rank"]))
    let bestRankRow = this.parentRowData.find(r => r["rank"] === bestRank)
    row["best-rank"] = bestRankRow["id"].slice(0,-1) + " " + bestRankRow["id"].slice(-1) + "-lap (" + bestRank + ")"

    let bestPts = Math.min(...this.parentRowData.map(r => r["points"]))
    let bestStdRows = this.parentRowData.filter(r => r["points"] === bestPts)
    let filtered = bestStdRows.map(row =>{
      let keyVals = Object.entries(row)
      return keyVals.map(keyVal => {
        return nonStdCols.includes(keyVal[0]) ? {diff: -1, row: row, col: keyVal[0]} : {diff: row["value"] - this.timeConverter(keyVal[1]), row: row, col: keyVal[0]}
      }).filter(x => x.diff > 0 || x.row["std"] === "God+10").sort((a,b) => a.diff-b.diff)[0]
    })
    filtered.forEach(f => {
      let upperColName = (f.row["std"].includes(" ") && this.nameMap[f.row["std"].slice(0,-2)]) ? this.nameMap[f.row["std"].slice(0,-2)] + f.row["std"].slice(-2) : f.row["std"]
      f.diff = f.diff / (f.row["std"] !== "God+10" ? this.timeConverter(f.row[upperColName]) - this.timeConverter(f.row[f.col]) : this.timeConverter(f.row["God+10"]))
    })
    console.log(filtered)
    let finalBestStdRow = filtered.find(f => f.diff === Math.min(...filtered.map(x => x.diff))).row
    let finalBestColName = (finalBestStdRow["std"].includes(" ") && this.nameMap[finalBestStdRow["std"].slice(0,-2)]) ? this.nameMap[finalBestStdRow["std"].slice(0,-2)] + finalBestStdRow["std"].slice(-2) : finalBestStdRow["std"]
    row["best-std"] = finalBestStdRow["id"].slice(0,-1) + " " + finalBestStdRow["id"].slice(-1) + "-lap (" + finalBestColName + ")"

    let worstPrsr = Math.min(...this.parentRowData.map(r => Number(r.prsr.slice(0,-1))))
    let worstPrsrRow = this.parentRowData.find(r => Number(r.prsr.slice(0,-1)) === worstPrsr)
    row["worst-prsr"] = worstPrsrRow["id"].slice(0,-1) + " " + worstPrsrRow["id"].slice(-1) + "-lap (" + worstPrsr + "%)"

    let worstRank = Math.max(...this.parentRowData.map(r => r["rank"]))
    let worstRankRow = this.parentRowData.find(r => r["rank"] === worstRank)
    row["worst-rank"] = worstRankRow["id"].slice(0,-1) + " " + worstRankRow["id"].slice(-1) + "-lap (" + worstRank + ")"

    let worstPts = Math.max(...this.parentRowData.map(r => r["points"]))
    let worstStdRows = this.parentRowData.filter(r => r["points"] === worstPts)
    let filtered2 = worstStdRows.map(row =>{
      let keyVals = Object.entries(row)
      return keyVals.map(keyVal => {
        return nonStdCols.includes(keyVal[0]) ? {diff: -1, row: row, col: keyVal[0]} : {diff: row["value"] - this.timeConverter(keyVal[1]), row: row, col: keyVal[0]}
      }).filter(x => x.diff > 0 || x.row["std"] === "God+10").sort((a,b) => a.diff-b.diff)[0]
    })
    filtered2.forEach(f => {
      let upperColName = (f.row["std"].includes(" ") && this.nameMap[f.row["std"].slice(0,-2)]) ? this.nameMap[f.row["std"].slice(0,-2)] + f.row["std"].slice(-2) : f.row["std"]
      f.diff = f.diff / (f.row["std"] !== "God+10" ? this.timeConverter(f.row[upperColName]) - this.timeConverter(f.row[f.col]) : this.timeConverter(f.row["God+10"]))
    })
    let finalWorstStdRow = filtered2.find(f => f.diff === Math.max(...filtered2.map(x => x.diff))).row
    let finalWorstColName = (finalWorstStdRow["std"].includes(" ") && this.nameMap[finalWorstStdRow["std"].slice(0,-2)]) ? this.nameMap[finalWorstStdRow["std"].slice(0,-2)] + finalWorstStdRow["std"].slice(-2) : finalWorstStdRow["std"]
    row["worst-std"] = finalWorstStdRow["id"].slice(0,-1) + " " + finalWorstStdRow["id"].slice(-1) + "-lap (" + finalWorstColName + ")"

    let easiestToRank = filtered2.find(f => f.diff === Math.min(...filtered2.map(x => x.diff)))
    row["goal"] = easiestToRank.row["id"].slice(0,-1) + " " + easiestToRank.row["id"].slice(-1) + "-lap (" + easiestToRank.col + ")"

    this.rowData.push(row)
  }

  timeConverter = (time) => {
    let minutes = time.includes("'") ? Number(time.split("'")[0]) : 0
    let seconds = Number((time.includes("'") ? time.split("'")[1] : time).split('"')[0])
    let milliseconds: any = time.split('"')[1]
    milliseconds = Number(milliseconds + "0".repeat(3 - milliseconds.length))
    let value: any = minutes*60 + seconds + milliseconds/1000
    return value
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }

  columnDefs = [{
    headerName: "Overall Statistics",
    children: [{
        headerName: "Average Points",
        field: "points",
        width: 120,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },{
        headerName: "Overall Standard",
        field: "std",
        width: 120,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },{
        headerName: "Average Finish",
        field: "af",
        width: 120,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },{
        headerName: "Average PRSR",
        field: "prsr",
        width: 120,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      }]
    },{
      headerName: "Best Races",
      children: [{
        headerName: "By PRSR",
        field: "best-prsr",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },
      {
        headerName: "By Rank",
        field: "best-rank",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },
      {
        headerName: "By Standard",
        field: "best-std",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      }]
    },{
      headerName: "Worst Races",
      children: [{
        headerName: "By PRSR",
        field: "worst-prsr",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },
      {
        headerName: "By Rank",
        field: "worst-rank",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      },
      {
        headerName: "By Standard",
        field: "worst-std",
        width: 140,
        cellStyle: {"text-align": 'center'},
        cellClassRules: { "cell-data-border": "true"},
      }]
    },{
      headerName: "Suggested Next Goal",
      field: "goal",
      width: 140,
      cellStyle: {"text-align": 'center'},
      cellClassRules: { "cell-data-border": "true"},
    }]

}
