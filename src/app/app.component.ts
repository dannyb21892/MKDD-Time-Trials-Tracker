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

  ngOnInit() {
    this.pps.getUserList().subscribe(() => {
      this.pps.getUserData("AJ Skinner").subscribe((data) => {console.log(data)})
    })
    this.pps.getStandards().subscribe(
      data => {
        console.log(data)
      },
      error => {
        console.log(error)
      }
    )
  }
}
