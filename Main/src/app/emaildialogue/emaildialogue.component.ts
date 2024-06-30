import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-emaildialogue',
  templateUrl: './emaildialogue.component.html',
  styleUrls: ['./emaildialogue.component.css']
})
export class EmaildialogueComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }

}
