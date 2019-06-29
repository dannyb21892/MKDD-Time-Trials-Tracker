import { Component, OnInit } from '@angular/core';
import { PlayersPageService } from 'src/app/services/players-page.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'mkddttt';

  constructor(private pps: PlayersPageService) {}

  userData: any
  standards: any
  wrs: any

  ngOnInit() {
    this.pps.getUserList().subscribe(() => {
      this.pps.getUserData("Daniel Baamonde").subscribe((data) => this.userData = data)
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
}
