import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
  dialogRef: any;
  constructor(public dialog: MatDialog,private router:Router){

  }


  closeUserDialog() {
     this.dialog.closeAll()
  }
}
