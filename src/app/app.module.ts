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
import { MatIconModule } from '@angular/material';
import { TreeviewModule } from 'ngx-treeview';
import { NgxLoadingModule, ngxLoadingAnimationTypes } from 'ngx-loading';


//components
import { AppComponent } from './app.component';
import { StandardsGrid } from './components/standards-grid.component'
import { OverallStats } from './components/overall-stats.component'
import { CellEditorComponent } from './components/cell-editor.component'
import { FAQComponent } from './components/faq.component'
import { TreeViewComponent } from './components/treeview.component'
import { SubmissionComponent } from './components/submission.component'
import { SingleSyncRenderer } from 'src/app/components/single-sync-renderer.component';


@NgModule({
  declarations: [
    AppComponent,
    StandardsGrid,
    CellEditorComponent,
    OverallStats,
    FAQComponent,
    TreeViewComponent,
    SubmissionComponent,
    SingleSyncRenderer
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    AgGridModule.withComponents([SingleSyncRenderer]),
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    TreeviewModule.forRoot(),
    NgxLoadingModule.forRoot({animationType: ngxLoadingAnimationTypes.wanderingCubes,})
  ],
  providers: [],
  bootstrap: [AppComponent],
  entryComponents: [CellEditorComponent, FAQComponent, TreeViewComponent, SubmissionComponent]
})
export class AppModule { }
