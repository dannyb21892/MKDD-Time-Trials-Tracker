import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StandardsGrid } from './components/standards-grid.component'
import { FAQComponent } from './components/faq.component'
import { TreeViewComponent } from './components/treeview.component'
import { SubmissionComponent } from './components/submission.component'


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'mkddttt';

  constructor(private pps: PlayersPageService, public dialog: MatDialog) {}

  userData: any;
  standards: any;
  wrs: any;
  dumbChangeDetector = {};

  username: string = "";
  syncDisabled: boolean = true;

  firstLoad: boolean = true

  public loading: boolean = false

  @ViewChild("nameField", {static: false})
  nameField: ElementRef

  @ViewChild(StandardsGrid, {static: false})
  private standardsGrid: StandardsGrid;

  ngOnInit() {
    this.refreshAllData(false)
  }

  refreshAllData = (fromInputBar = false) => {
    let firstLoad = this.firstLoad
    this.firstLoad = false
    this.loading = true
    let userDataDone = false
    let standardsDone = false
    let wrsDone = false
    this.pps.getUserList().subscribe(() => {
      this.pps.getOverallRanks().subscribe(() => {
        let localStorage = this.pps.getLocalStorage()
        if((localStorage && localStorage.username) || fromInputBar){
          this.username = fromInputBar ? this.username : (firstLoad ? localStorage.username : this.username)
          this.pps.getUserData(this.username).subscribe((data) => {
            this.pps.setLocalStorage(null, !firstLoad)
            this.userData = data;
            this.syncDisabled = false
            userDataDone = true
            if(standardsDone && wrsDone) this.loading = false
          })
        }
        else {
          this.pps.setLocalStorage(null, !firstLoad)
          this.pps.getUserData("").subscribe((data) => {
            this.userData = data;
            this.syncDisabled = false
            userDataDone = true
            if(standardsDone && wrsDone) this.loading = false
          })
        }
      })
      }
    )
    this.pps.getStandards().subscribe(
      data => {
        this.standards = data
        standardsDone = true
        if(userDataDone && wrsDone) this.loading = false
      }
    )
    this.pps.getWRs().subscribe(
      data => {
        this.wrs = data
        wrsDone = true
        if(standardsDone && userDataDone) this.loading = false
      }
    )
  }

  listenForEnter = () => {
    this.nameField.nativeElement.addEventListener("keypress", this.onEnter)
  }

  removeListener = () => {
    this.nameField.nativeElement.removeEventListener("keypress", this.onEnter)
  }

  onEnter = key => {
    if(key.key === "Enter"){
      this.refreshAllData(true)
    }
  }

  showFAQ = () => {
    let dialogRef = this.dialog.open(FAQComponent, {width: '90%', maxWidth: "100%", maxHeight: "95%", height: "95%"});
  }

  showTreeView = () => {
    let dialogRef = this.dialog.open(TreeViewComponent, {width: '300px', maxWidth: "100%", maxHeight: "630px", height: "630px", data: this.standardsGrid.gridColumnApi});
  }

  submit = () => {
    let dialogRef = this.dialog.open(SubmissionComponent, {width: '500px', maxWidth: "100%", maxHeight: "850px", height: "850px", data: this.standardsGrid.gridApi});
  }
}
