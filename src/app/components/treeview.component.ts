import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'treeview',
  templateUrl: './treeview.component.html',
})
export class TreeViewComponent implements OnInit {

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 1000
  }

  items = []

  courseTrialColumns = []
  userDataAndGoalsColumns = []
  standardsColGroups = []
  standardsColumns = []

  constructor(public dialogRef: MatDialogRef<TreeViewComponent>,
              @Inject(MAT_DIALOG_DATA) public gridColumnApi: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    let items = this.gridColumnApi.getAllColumns()

    this.courseTrialColumns = items.filter(i => ["trial", "course"].includes(i["colId"]))
    this.standardsColumns = items.filter(i => i["colId"] === this.capitalize(i["colId"]))
    this.userDataAndGoalsColumns = items.filter(i => !["trial", "course"].includes(i["colId"]) && i["colId"] !== this.capitalize(i["colId"]))
    this.standardsColGroups = [...new Set(this.standardsColumns.map(i => i.originalParent))]

    items = this.userDataAndGoalsColumns.concat(this.standardsColGroups)
    items.forEach(i => {
      i["textField"] = i["colDef"] ? i["colDef"]["headerName"] : i["colGroupDef"]["headerName"]
    })
    this.items = items
  }

  onSelectedChange(params) {
    //first turn all columns invisible
    this.gridColumnApi.setColumnsVisible(this.gridColumnApi.getColumnState().map(c => c["colId"]), false)
    //get columns supposed to be visible
    let visibleColumnGroups = params.filter(col => !col.colId)
    let visibleUserDataAndGoalColumns = params.filter(col => col.colId)
    let visibleColumnGroupChildren = this.standardsColumns.filter(x => visibleColumnGroups.includes(x.originalParent))
    let allVisibleColumns = visibleUserDataAndGoalColumns.concat(visibleColumnGroupChildren).concat(this.courseTrialColumns).map(c => c["colId"])
    //set local storage memory and set columns visible
    window.localStorage.setItem("mkdd--colVisPrefs", allVisibleColumns)
    this.gridColumnApi.setColumnsVisible(allVisibleColumns, true)
  }

  capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

}
