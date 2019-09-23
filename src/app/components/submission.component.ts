import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PlayersPageService } from 'src/app/services/players-page.service';

@Component({
  selector: 'submission',
  templateUrl: './submission.component.html',
})
export class SubmissionComponent implements OnInit {

  items = []
  data = ""
  newPlayer = false
  displayItems = false
  country = null
  town = null
  email = null
  message=''

  constructor(public dialogRef: MatDialogRef<SubmissionComponent>,
              private pps: PlayersPageService,
              @Inject(MAT_DIALOG_DATA) public gridApi: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    let username = this.pps.getUsername()
    this.newPlayer = !this.pps.userList[username]
    let userData = this.pps.getLocalStorage()
    let courses = Object.keys(userData).filter(x => x !== "username")
    if(courses.length === 0) return;

    let subHistory = JSON.parse(window.localStorage.getItem("mkdd--submissions")) || {}
    if(!subHistory[username]) subHistory[username] = {}

    let data = ""

    for (let i = 0; i < 32; i++){
      data += (i === 0 ? '' : '&') + `${i}=`;
      let relevantCourse = courses.filter(x => x.slice(0,-1) === this.pps.courseNamesAbbv[Math.floor(i/2)]).filter(x => x.includes(i%2 === 0 ? "3" : "f"))
      let submissionTime = userData[relevantCourse[0]] ? this.pps.timeConverter(userData[relevantCourse[0]]["time"]) : Infinity
      let prevSubmissionTime = subHistory[username][relevantCourse[0]]
      if(relevantCourse.length === 1 && submissionTime < userData[relevantCourse[0]]["value"]) {
        if(!prevSubmissionTime || submissionTime < prevSubmissionTime){
          data += userData[relevantCourse[0]]["time"]
                  .split("'").join("%27")
                  .split('"').join("%22")
          this.displayItems = true
          this.items.push([`${relevantCourse[0].slice(0,-1) + " " + relevantCourse[0].slice(-1)}lap`, userData[relevantCourse[0]]["time"], relevantCourse[0]])
        }
      }
    }

    this.data = data
  }

  submit = () => {
    //newname=&country=&region=&addy=&hertz=sixty&
    let username = this.pps.getUsername()
    this.data += "&message=" + encodeURI(this.message).split("%20").join("+")
    if(!this.newPlayer)
      this.data += "&name=" + encodeURI(username).split("%20").join("+")

    if(this.newPlayer) this.data = "newname=" + encodeURI(username).split("%20").join("+") +
                                   "&country=" + encodeURI(this.country).split("%20").join("+") +
                                   "&region=" + encodeURI(this.town).split("%20").join("+") +
                                   "&addy=" + encodeURI(this.email).split("%20").join("+") +
                                   "&hertz=" + "sixty&" +
                                   this.data

    let subHistory = JSON.parse(window.localStorage.getItem("mkdd--submissions")) || {}
    if(!subHistory[username]) subHistory[username] = {}
    this.items.forEach(i => {
      subHistory[username][i[2]] = this.pps.timeConverter(i[1])
    })
    this.pps.postSubmission(this.data, subHistory)
    this.dialogRef.close()
  }



}
