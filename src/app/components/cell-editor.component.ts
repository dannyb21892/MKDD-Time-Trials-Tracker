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
        this.cancelBeforeStart = params.charPress && (`123456789`.indexOf(params.charPress) < 0);
    }

    getValue(): any {
        return this.value;
    }

    isCancelBeforeStart(): boolean {
        return this.cancelBeforeStart;
    }

    // will reject the number if it greater than 1,000,000
    // not very practical, but demonstrates the method.
    isCancelAfterEnd(): boolean {
        return !(this.value.includes('"') && !!this.value.split('"')[1])
    };

    onKeyDown(event): void {
        if (!this.isKeyPressedValid(event)) {
            if (event.preventDefault) event.preventDefault();
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

    private isKeyPressedValid(event): boolean {
        const charCode = this.getCharCodeFromEvent(event);
        const charStr = event.key ? event.key : String.fromCharCode(charCode);
        if(["Backspace", "Delete"].includes(charStr)){this.value = ""; return false;}
        else if(!`1234567890'"`.includes(charStr)){ return false;}
        else if(this.value.length >= 8){ return false;}
        else if(this.value.length === 0){ return "123456789".includes(charStr);}
        else if(this.value.length === 1){ return true;}
        else if(this.value.length === 2){
          if(this.value.includes("'") || this.value.includes('"')){return "1234567890".includes(charStr)}
          else {return charStr === '"'}
        }
        else if(this.value.length === 3){return "1234567890".includes(charStr)}
        else if(this.value.length === 4){
          if(this.value.includes("'")){return charStr === '"'}
          else {return "1234567890".includes(charStr)}
        }
        else if(this.value.length === 5){
          if(this.value.includes("'") || this.value[2] === '"'){return "1234567890".includes(charStr)}
          else {return false}
        }
        else if(this.value.length === 6){
          if(this.value.includes("'")){return "1234567890".includes(charStr)}
          else {return false}
        }
        else {return "1234567890".includes(charStr)}
    }
}
