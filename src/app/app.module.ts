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
import { TreeviewModule } from 'ngx-treeview';


//components
import { AppComponent } from './app.component';
import { StandardsGrid } from './components/standards-grid.component'
import { OverallStats } from './components/overall-stats.component'
import { CellEditorComponent } from './components/cell-editor.component'
import { FAQComponent } from './components/faq.component'
import { TreeViewComponent } from './components/treeview.component'

@NgModule({
  declarations: [
    AppComponent,
    StandardsGrid,
    CellEditorComponent,
    OverallStats,
    FAQComponent,
    TreeViewComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([]),
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    TreeviewModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [CellEditorComponent, FAQComponent, TreeViewComponent]
})
export class AppModule { }
