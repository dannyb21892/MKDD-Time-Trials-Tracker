import {AfterViewInit, Component, ViewChild, ViewContainerRef} from "@angular/core";

import {ICellEditorAngularComp} from "ag-grid-angular";

@Component({
    selector: 'cell-editor',
    template: `<input #input (keydown)="onKeyDown($event)" [(ngModel)]="value" style="width: 100%">`
})
export class CellEditorComponent implements ICellEditorAngularComp, AfterViewInit {
    private params: any;
    public value: string;
    private cancelBeforeStart: boolean = false;

    @ViewChild('input', {read: ViewContainerRef, static: false}) public input;


    agInit(params: any): void {
        this.params = params;
        this.value = this.params.value;

        // only start edit if key pressed is a number, not a letter
        this.cancelBeforeStart = params.charPress && (`123456789`.indexOf(params.charPress) < 0)
    }

    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    isCancelAfterEnd(): boolean {
      if(this.params.colDef.field === "time" || this.params.colDef.field === "goal-time"){
        let timeFinder = /[1-9]\'[0-9][0-9]\"[0-9][0-9]?[0-9]?|[1-9]\"[0-9][0-9]?[0-9]?|[1-9][0-9]\"[0-9][0-9]?[0-9]?/g; //times of the form x'yy"zzz or x"zzz where x must be 1-9, and zzz can be zz or z also
        let potentialMatch = this.value ? this.value.match(timeFinder) : null
        let out
        if(potentialMatch){
          out = potentialMatch[0] !== this.value || this.timeConverter(potentialMatch[0]) >= this.timeConverter(this.params.node.data.time)
        }
        else {
          out = true
        }
        return out
      }
      else if(this.params.colDef.field === "goal-rank"){
        return Number(this.value) <= 0 || Number(this.value) >= this.params.node.data.rank
      }
    };

    onKeyDown(event): void {
      if(this.params.colDef.field === "time" || this.params.colDef.field === "goal-time"){
        if (!this.isKeyPressedValidForTime(event) && event.preventDefault) {
            event.preventDefault();
        }
      }
      else if(this.params.colDef.field === "goal-rank"){
        if (!this.isKeyPressedValidForRank(event) && event.preventDefault) {
            event.preventDefault();
        }
      }
    }

    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        setTimeout(() => {
            this.input.element.nativeElement.focus();
        })
    }

    private getCharCodeFromEvent(event): any {
        event = event || window.event;
        return (typeof event.which == "undefined") ? event.keyCode : event.which;
    }

    private isKeyPressedValidForTime(event): boolean {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        if(["ArrowLeft","ArrowRight","Backspace","Delete","1","2","3","4","5","6","7","8","9","0","'",'"'].includes(charStr)){ return true;}
        else{return false;}

    }

    private isKeyPressedValidForRank(event): boolean {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        if(["ArrowLeft","ArrowRight","Backspace","Delete","1","2","3","4","5","6","7","8","9","0"].includes(charStr)){ return true;}
        else{return false;}
    }

    timeConverter = (time) => {
      let minutes = time.includes("'") ? Number(time.split("'")[0]) : 0
      let seconds = Number((time.includes("'") ? time.split("'")[1] : time).split('"')[0])
      let milliseconds: any = time.split('"')[1]
      milliseconds = Number(milliseconds + "0".repeat(3 - milliseconds.length))
      let value: any = minutes*60 + seconds + milliseconds/1000
      return value
    }
}
