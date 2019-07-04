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

    let points = this.parentRowData.map(r => r.points)
    row["points"] = points.length ? Math.round(100*points.reduce((a,b) => a + Number(b), 0)/points.length)/100 : "N/A"

    let ranks = this.parentRowData.map(r => r.rank)
    row["af"] = ranks.length ? Math.round(ranks.reduce((a,b) => a + Number(b), 0)/ranks.length) : "N/A"

    let prsrs = this.parentRowData.map(r => r.prsr)
    row["prsr"] = prsrs.length ? (Math.round(100*prsrs.reduce((a,b) => a + Number(b.slice(0,-1)), 0)/prsrs.length)/100) + "%" : "N/A"

    let pointPairs = Object.entries(this.pointMap).sort((a,b) => Number(a[1]) - Number(b[1]))
    let std = pointPairs.find(x => x[1] > row["points"])
    row["std"] = std ? std[0] : "Newbie"

    this.rowData.push(row)
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
  }]

}
