import { Component, OnInit, OnChanges, SimpleChanges, Inject } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'treeview',
  templateUrl: './treeview.component.html',
})
export class TreeViewComponent implements OnInit, OnChanges {

  config = {
    hasAllCheckBox: false,
    hasFilter: false,
    hasCollapseExpand: false,
    decoupleChildFromParent: false,
    maxHeight: 1000
  }

  items = []
  otherColumns = []

  constructor(public dialogRef: MatDialogRef<TreeViewComponent>,
              @Inject(MAT_DIALOG_DATA) public gridColumnApi: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    let items = this.gridColumnApi.getAllColumns()
    items = items.filter(i => !["trial", "course"].includes(i["colId"]) && i["colId"] !== this.capitalize(i["colId"]))
    this.otherColumns = this.gridColumnApi.getColumnState().filter(i => ["trial", "course"].includes(i["colId"]) || i["colId"] === this.capitalize(i["colId"]))
    items.forEach(i => {
      i["textField"] = i["colDef"]["headerName"]
    })
    this.items = items
  }

  ngOnChanges(params) {

  }

  onSelectedChange(params) {
    this.gridColumnApi.setColumnsVisible(this.gridColumnApi.getColumnState().map(c => c["colId"]), false)
    window.localStorage.setItem("mkdd--colVisPrefs", params.concat(this.otherColumns).map(c => c["colId"]))
    this.gridColumnApi.setColumnsVisible(params.concat(this.otherColumns).map(c => c["colId"]), true)
  }

  capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

}
