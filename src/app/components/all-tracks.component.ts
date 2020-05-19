import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'all-tracks',
  templateUrl: './all-tracks.component.html',
})
export class AllTracksComponent implements OnInit {

  currentCourseIndex = 0
  currentCourse
  currentGold
  currentPbSplit

  pbDiffs = []
  totalDiff: any = `-'--"---`

  invalidInput = false

  golds = []
  courses = []
  times = []

  readouts = []

  pb
  pbTime
  bpt
  total = '0'

  m = ''
  s = ''
  ms = ''

  newPB = false
  noNewPB = false

  constructor(public dialogRef: MatDialogRef<AllTracksComponent>,
              @Inject(MAT_DIALOG_DATA) public inputData: any) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    let allTracksPbs = JSON.parse(window.localStorage.getItem("mkdd--allTracks"))
    if(!allTracksPbs && this.inputData.username) {
      let newAllTracks = {};
      newAllTracks[`${this.inputData.username}`] = [];
      window.localStorage.setItem("mkdd--allTracks", JSON.stringify(newAllTracks))
    }
    this.pb = allTracksPbs && allTracksPbs[this.inputData.username] ? allTracksPbs[this.inputData.username] : []
    this.pbTime = this.valueConverter(this.pb.reduce((a,b) => a + b, 0))

    this.inputData.gridApi.forEachNode((n, i) => {
      if(i%2 == 0) {
        this.courses.push(n.data.course)
        this.golds.push(this.timeConverter(n.data.time))
      }
    })
    this.readouts = this.courses.map(c => c + `:  -'--"---`)
    this.bpt = this.golds.length === 16 ? this.valueConverter(this.golds.reduce((a,b) => a+b, 0)) : `-'--"---`
    this.currentGold = this.golds[0] ? this.valueConverter(this.golds[0]) : `-'--"---`
    this.currentPbSplit = this.pb[0] ? this.valueConverter(this.pb[0]) : `-'--"---`
    this.currentCourse = this.courses[0]
  }

  submit = () => {
    if(this.currentCourseIndex <=15 && this.m.length < 2 && !isNaN(Number(this.m)) && this.s.length < 3 && !isNaN(Number(this.s)) && Number(this.s) < 60 && this.ms.length < 4 && !isNaN(Number(this.ms))){
      this.invalidInput = false
      let time = (this.m || '0') + "'" + ('0'.repeat(2-this.s.length) + this.s) + '"' + ('0'.repeat(3-this.ms.length) + this.ms)
      this.times.push(this.timeConverter(time))
      this.total = this.valueConverter(this.times.reduce((a,b) => a + b, 0))
      let diff: any = this.pb[this.currentCourseIndex] ? this.pb[this.currentCourseIndex] - this.timeConverter(time) : null
      if(diff) this.pbDiffs.push(diff)
      this.totalDiff = this.pbDiffs.length ? this.pbDiffs.reduce((a,b) => a + b, 0) : null
      this.totalDiff = (this.totalDiff || this.totalDiff === 0) ? (this.totalDiff <= 0 ? "+" : "-") + this.valueConverter(this.totalDiff) : `-'--"---`
      diff = (diff || diff === 0) ? (diff <= 0 ? "+" : "-") + this.valueConverter(diff) : null
      this.readouts[this.currentCourseIndex] = this.currentCourse + ": " + time + (diff ? " (" + diff + ")" : "")
      this.currentCourseIndex += 1
      this.currentCourse = this.courses[this.currentCourseIndex] || this.currentCourse
      this.currentGold = this.golds[this.currentCourseIndex] ? this.valueConverter(this.golds[this.currentCourseIndex]) : `-'--"---`
      this.currentPbSplit = this.pb[this.currentCourseIndex] ? this.valueConverter(this.pb[this.currentCourseIndex]) : `-'--"---`
      this.bpt = this.golds.length === 16 ? this.valueConverter(this.times.reduce((a,b) => a + b, 0) + this.golds.slice(this.times.length).reduce((a,b) => a + b, 0)) : `-'--"---`
      this.m = ''
      this.s = ''
      this.ms = ''
      if(this.currentCourseIndex === 16) this.finalize()
    }
    else if(this.currentCourseIndex <= 15) {
      this.invalidInput = true
    }
  }

  finalize = () => {
    if(!this.pb.length || this.pbDiffs.reduce((a,b) => a + b, 0) > 0){
      this.newPB = true
      let allTracksData = JSON.parse(window.localStorage.getItem("mkdd--allTracks"))
      allTracksData[this.inputData.username] = this.times
      window.localStorage.setItem("mkdd--allTracks", JSON.stringify(allTracksData))
    }
    else{
      this.noNewPB = true
    }
  }

  clearPB = () => {
    let allTracksData = JSON.parse(window.localStorage.getItem("mkdd--allTracks"))
    allTracksData[this.inputData.username] = []
    window.localStorage.setItem("mkdd--allTracks", JSON.stringify(allTracksData))
  }

  timeConverter = (time) => {
    let minutes = time.includes("'") ? Number(time.split("'")[0]) : 0
    let seconds = Number((time.includes("'") ? time.split("'")[1] : time).split('"')[0])
    let milliseconds: any = time.split('"')[1]
    milliseconds = Number(milliseconds + "0".repeat(3 - milliseconds.length))
    let value: any = minutes*60 + seconds + milliseconds/1000
    return value
  }

  valueConverter = (val) => {
    val = Math.round(val*1000)/1000 //round to nearest thousandth to prevent floating point inaccuracy
    let minutes = Math.floor(val/60)
    let seconds = Math.floor(val - 60*minutes)
    let milliseconds: any = Math.round(1000*(val - Math.floor(val)))
    let out = minutes ? `${minutes}'` : ""
    out += seconds === 0 ? (minutes ? '00"' : '0"') : (seconds < 10 ? (minutes ? `0${seconds}"` : `${seconds}"`) : `${seconds}"`)
    milliseconds = milliseconds === 0 ? '0' : (milliseconds < 10 ? `00${milliseconds}` : (milliseconds < 100 ? `0${milliseconds}` : `${milliseconds}`))
    while(milliseconds.length > 1 && milliseconds.slice(-1)==="0"){
      milliseconds = milliseconds.slice(0,-1)
    }
    return out + milliseconds
  }
}
