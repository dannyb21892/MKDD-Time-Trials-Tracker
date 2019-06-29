import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';

@Component({
  selector: 'standards-grid',
  templateUrl: './standards-grid.component.html',
  styleUrls: ['./standards-grid.component.scss']
})
export class StandardsGrid implements OnInit, OnChanges {

  @Input() standards: any;
  @Input() wrs: any;
  @Input() userData: any;

  columnDefs = [];
  rowData = [];

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    Object.keys(changes).forEach(key => {
      this[key] = changes[key].currentValue
      console.log(`set${this.capitalize(key)}`)
      this[`set${this.capitalize(key)}`]()
    })
  }

  setStandards = () => {
    this.columnDefs = [];
    this.rowData = [];
    if(!this.standards) return

    let allBuckets = Object.keys(this.standards.standards[Object.keys(this.standards.standards)[0]].fastLap)
    let headers = [...new Set(allBuckets.map(k => k.split(" ")[0].split("+")[0]))]

    this.columnDefs.push({
      headerName: "Course",
      field: "course",
      rowSpan: function(params) {
        return 2;
      },
      cellClassRules: { "cell-span": "value.length > 0", "cell-border": "value !== 'LC'"},
    })
    this.columnDefs.push({
      headerName: "Trial",
      field: "trial"
    })

    headers.forEach(h => {
      let children = allBuckets.filter(b => b.includes(h))
      if(h === "God")
        children.sort((a,b) => Number(b.split("+")[1]) - Number(a.split("+")[1]))
      else {
        children.sort()
        if(children.slice(-1).includes("+"))
          children = [...children.slice(-1), ...children.slice(0,-1)]
      }

      let colDef = {
        headerName: h,
        field: h,
        children: children.map(c => {
          console.log(allBuckets[c], c, allBuckets)
          return {
            headerName: c + " (" + this.standards.standards[Object.keys(this.standards.standards)[0]].fastLap[c].points + " pts)",
            field: c,
          }
        })
      }

      this.columnDefs.push(colDef)
    })

    this.standards.courses.forEach(course => {
      let row1 = {
        course: course,
        trial: "3-lap",
      }
      let row2 = {
        course: "",
        trial: "f-lap",
      }
      allBuckets.forEach(b => {
        row1[b] = this.standards.standards[course].threeLap[b].time
        row2[b] = this.standards.standards[course].fastLap[b].time
      })
      this.rowData.push(row1)
      this.rowData.push(row2)
    })

  }

  setWrs = () => {

  }

  setUserData = () => {

  }

  capitalize = (s: string) => s[0].toUpperCase() + s.slice(1)

}
