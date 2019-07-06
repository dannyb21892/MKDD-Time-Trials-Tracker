import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FAQComponent } from './components/faq.component'

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
  lastValidUsername: string = ""
  syncDisabled: boolean = true;

  @ViewChild("nameField", {static: false})
  nameField: ElementRef

  ngOnInit() {
    this.pps.getUserList().subscribe(() => {
      let localStorage = this.pps.getLocalStorage()
      if(localStorage && localStorage.username){
        this.username = localStorage.username
        this.pps.getUserData(localStorage.username).subscribe((data) => {
          this.userData = data;
          this.syncDisabled = false
        })
      }
      else {
        this.pps.getUserData("").subscribe((data) => {
          this.userData = data;
          this.syncDisabled = false
        })
      }
    })
    this.pps.getStandards().subscribe(
      data => {
        this.standards = data
      },
      error => {
      }
    )
    this.pps.getWRs().subscribe(
      data => {
        this.wrs = data
      },
      error => {
      }
    )
  }

  getUserData = () => {
    console.log(this.username)
    this.pps.getUserData(this.username, true).subscribe(
      (data) => {
        if(Object.keys(data).length){
          console.log(data)
          this.userData = data;
          this.syncDisabled = false
        } else {
          this.userData = {};
          this.syncDisabled = false;
          this.username = "";
        }
      },
      (error) => {
      }
    )
    this.nameField.nativeElement.removeEventListener("keypress", this.onEnter)
  }

  listenForEnter = () => {
    this.nameField.nativeElement.addEventListener("keypress", this.onEnter)
  }

  syncData = () => {
    this.pps.setLocalStorage(null)
    this.dumbChangeDetector = {};
    //this.userData = Object.assign({}, this.userData)
  }

  onEnter = key => {
    if(key.key === "Enter"){
      this.getUserData()
    }
  }

  showFAQ = () => {
    let dialogRef = this.dialog.open(FAQComponent, {width: '90%', maxWidth: "100%", maxHeight: "95%", height: "95%"});
  }
}
