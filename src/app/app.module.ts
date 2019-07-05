//Angular
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//libraries
import { AgGridModule } from 'ag-grid-angular';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

//components
import { AppComponent } from './app.component';
import { StandardsGrid } from './components/standards-grid.component'
import { OverallStats } from './components/overall-stats.component'
import { CellEditorComponent } from './components/cell-editor.component'
import { FAQComponent } from './components/faq.component'

@NgModule({
  declarations: [
    AppComponent,
    StandardsGrid,
    CellEditorComponent,
    OverallStats,
    FAQComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [CellEditorComponent, FAQComponent]
})
export class AppModule { }
