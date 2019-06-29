import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
//libraries
import { AgGridModule } from 'ag-grid-angular';

//components
import { StandardsGrid } from './components/standards-grid.component'

@NgModule({
  declarations: [
    AppComponent,
    StandardsGrid
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AgGridModule.withComponents([])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
