import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
    selector: 'single-sync-renderer',
    templateUrl: `./single-sync-renderer.component.html`,
})
export class SingleSyncRenderer implements ICellRendererAngularComp {
    public params: any;

    agInit(params: any): void {
        this.params = params;
    }

    public invokeParentMethod() {
        this.params.node.setDataValue("time", this.valueConverter(this.params.node.data.value))
    }

    refresh(): boolean {
        return false;
    }

    valueConverter = (val) => {
      val = Math.round(val*1000)/1000 //round to nearest thousandth to prevent floating point inaccuracy
      let minutes = Math.floor(val/60)
      let seconds = Math.floor(val - 60*minutes)
      let milliseconds: any = Math.ceil(1000*(val - Math.floor(val)))
      let out = minutes ? `${minutes}'` : ""
      out += seconds === 0 ? (minutes ? '00"' : '0"') : (seconds < 10 ? (minutes ? `0${seconds}"` : `${seconds}"`) : `${seconds}"`)
      milliseconds = milliseconds === 0 ? '0' : (milliseconds < 10 ? `00${milliseconds}` : (milliseconds < 100 ? `0${milliseconds}` : `${milliseconds}`))
      while(milliseconds.length > 1 && milliseconds.slice(-1)==="0"){
        milliseconds = milliseconds.slice(0,-1)
      }
      return out + milliseconds
    }
}
