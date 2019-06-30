//Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//libraries
import { AgGridModule } from 'ag-grid-angular';
import { MatInputModule } from '@angular/material/input';

//components
import { AppComponent } from './app.component';
import { StandardsGrid } from './components/standards-grid.component'

@NgModule({
  declarations: [
    AppComponent,
    StandardsGrid
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    MatInputModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
