import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PlayersPageService } from 'src/app/services/players-page.service';
import { ClipboardService } from 'ngx-clipboard'

@Component({
  selector: 'submission',
  templateUrl: './submission.component.html',
})
export class SubmissionComponent implements OnInit {

  items = []
  data = ""
  timesToSubmit = ""
  newPlayer = false
  displayItems = false
  country = null
  town = null
  email = null
  message=''
  forumName=''
  preview=''
  hz='60Hz'
  copied=false;

  @ViewChild("previewEl", {static: false})
  previewEl: ElementRef

  constructor(public dialogRef: MatDialogRef<SubmissionComponent>,
              private pps: PlayersPageService,
              private clip: ClipboardService,
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

    let timesToSubmit = ""

    for (let i = 0; i < 32; i++){
      let relevantCourse = courses.filter(x => x.slice(0,-1) === this.pps.courseNamesAbbv[Math.floor(i/2)]).filter(x => x.includes(i%2 === 0 ? "3" : "f"))
      let submissionTime = userData[relevantCourse[0]] ? this.pps.timeConverter(userData[relevantCourse[0]]["time"]) : Infinity
      let prevSubmissionTime = subHistory[username][relevantCourse[0]]
      if(relevantCourse.length === 1 && submissionTime < userData[relevantCourse[0]]["value"]) {
        if(!prevSubmissionTime || submissionTime < prevSubmissionTime){
          timesToSubmit += (this.displayItems ? "%0D%0A" : '') + `${relevantCourse[0].slice(0,-1) + "+" + relevantCourse[0].slice(-1)}lap%3A+`;
          timesToSubmit += userData[relevantCourse[0]]["time"]
                  .split("'").join("%27")
                  .split('"').join("%22")
          this.displayItems = true
          this.items.push([`${relevantCourse[0].slice(0,-1) + " " + relevantCourse[0].slice(-1)}lap`, userData[relevantCourse[0]]["time"], relevantCourse[0]])
        }
      }
    }

    this.timesToSubmit = timesToSubmit;
  }

  onHzChange = (event) => {
    this.hz = event.target.value;
  }

  copyText = () => {
    this.clip.copyFromContent(this.previewEl.nativeElement.innerText)
    this.copied = true;
  }

  submit = () => {
    this.displayItems = false;
    let br = "<br/>"
    if(this.newPlayer){
      this.preview = "I'm a new player!" + br + "Country: " + this.country + br + "Region: " + this.town + br + "E-Mail: " + this.email + br
    }
    let d = new Date().toLocaleString('default', {year: 'numeric', month: 'long', day: 'numeric'});
    this.preview += "Date: " + d + br + "Name: " + this.pps.getUsername() + br + br + this.hz + br + br + this.items.map(item => `${item[0]}: ${item[1]}`).join(br) + br + br + this.message;
  }

  goBack = () => {
    this.preview = '';
    this.displayItems = true;
    this.copied = false;
  }

  //example post:
  //PostReply=title&threadid=1571543717&subject=New+PRs&formsession=Mario+Kart+MBdbaamonde21892
  //&playerName=Daniel+Baamonde&hertz=60Hz&comments=test
  //&message=Date%3A+May+19%2C+2020%0D%0AName%3A+Daniel+Baamonde%0D%0A%0D%0A60Hz%0D%0A%0D%0ALC%3A+1%3A16.123%0D%0ALC%3A+0%3A25.299%0D%0A%0D%0Atest&post=Post
  // submit = () => {
  //   let username = encodeURI(this.pps.getUsername()).split("%20").join("+");
  //   let forumName = encodeURI(this.forumName).split("%20").join("+");
  //   let d = new Date();
  //   let messageDate = encodeURI(d.toLocaleString('default', {year: 'numeric', month: 'long', day: 'numeric'})).split("%20").join("+");
  //   let newLine = "%0D%0A";
  //   let hertz = "60hz";
  //   let message = encodeURI(this.message).split("%20").join("+");
  //   this.data =  "PostReply=title&threadid=1571543717&subject=New+PRs&formsession=Mario+Kart+MB" + forumName
  //             +  "&playerName=" + username + "&hertz=" + hertz + "&comments=" + message + "&message="
  //             +  messageDate + newLine + username + newLine + newLine + hertz + newLine + newLine + this.timesToSubmit + newLine + newLine + message
  //             +  "&post=Post";
  //
  //   let subHistory = JSON.parse(window.localStorage.getItem("mkdd--submissions")) || {};
  //   if(!subHistory[username]) subHistory[username] = {};
  //   this.items.forEach(i => {
  //     subHistory[username][i[2]] = this.pps.timeConverter(i[1]);
  //   })
  //   this.pps.postSubmission(this.data, subHistory, this.pps.getUsername());
  //  this.dialogRef.close();
  // }

  // oldSnorgeSubmit = () => {
  //   //newname=&country=&region=&addy=&hertz=sixty&
  //   let username = this.pps.getUsername()
  //   this.data += "&message=" + encodeURI(this.message).split("%20").join("+")
  //   if(!this.newPlayer)
  //     this.data += "&name=" + encodeURI(username).split("%20").join("+")
  //
  //   if(this.newPlayer) this.data = "newname=" + encodeURI(username).split("%20").join("+") +
  //                                  "&country=" + encodeURI(this.country).split("%20").join("+") +
  //                                  "&region=" + encodeURI(this.town).split("%20").join("+") +
  //                                  "&addy=" + encodeURI(this.email).split("%20").join("+") +
  //                                  "&hertz=" + "sixty&" +
  //                                  this.data
  //
  //   let subHistory = JSON.parse(window.localStorage.getItem("mkdd--submissions")) || {}
  //   if(!subHistory[username]) subHistory[username] = {}
  //   this.items.forEach(i => {
  //     subHistory[username][i[2]] = this.pps.timeConverter(i[1])
  //   })
  //   this.pps.postSubmission(this.data, subHistory)
  //   this.dialogRef.close()
  // }



}
