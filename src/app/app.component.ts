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

  username: string = "";
  lastValidUsername: string = ""

  @ViewChild("nameField", {static: false})
  nameField: ElementRef

  ngOnInit() {
    this.pps.getUserList().subscribe(() => {
      //this.pps.getUserData("Daniel Baamonde").subscribe((data) => this.userData = data)
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
    console.log(this.username)
    this.pps.getUserData(this.username).subscribe(
      (data) => {if(Object.keys(data).length) this.userData = data},
      (error) => console.log(error)
    )
    this.nameField.nativeElement.removeEventListener("keypress", this.onEnter)
  }

  listenForEnter = () => {
    this.nameField.nativeElement.addEventListener("keypress", this.onEnter)
  }

  onEnter = key => {
    console.log(key)
    if(key.key === "Enter"){
      this.getUserData()
    }
  }
}
