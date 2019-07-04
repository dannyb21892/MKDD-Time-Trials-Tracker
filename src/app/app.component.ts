import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'mkddttt';

  constructor(private pps: PlayersPageService) {}

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
      console.log(localStorage)
      if(localStorage && localStorage.username){
        this.username = localStorage.username
        this.pps.getUserData(localStorage.username).subscribe((data) => {
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
        console.log(error)
      }
    )
    this.pps.getWRs().subscribe(
      data => {
        this.wrs = data
      },
      error => {
        console.log(error)
      }
    )
  }

  getUserData = () => {
    this.pps.getUserData(this.username, true).subscribe(
      (data) => {
        if(Object.keys(data).length){
          this.userData = data;
          console.log(this.userData)
          this.syncDisabled = false
        } else {
          this.userData = {};
          this.syncDisabled = false;
          this.username = "";
        }
      },
      (error) => {
        console.log("hi", error)
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
}
