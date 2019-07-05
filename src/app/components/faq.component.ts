import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'faq',
  templateUrl: 'faq.component.html',
})
export class FAQComponent {

  constructor(public dialogRef: MatDialogRef<FAQComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
