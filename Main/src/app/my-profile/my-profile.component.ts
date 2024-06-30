import { Dialog } from '@angular/cdk/dialog';
import { Component } from '@angular/core';
import { ChangeEmailComponent } from './change-email/change-email.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent {
  password: any;
  userEmail: any;
  userFirstName: any;
  userapi_key: any;
  usercredit: any;
userLastName:any
dialogRef: any;
constructor(public dialog: Dialog) {}
  ngOnInit(): void {
      // Retrieve user details from local storage
      this.userFirstName = localStorage.getItem('firstName');
      this.password = localStorage.getItem('password');
      this.userEmail = localStorage.getItem('email');
      this.userLastName=localStorage.getItem('lastName')
      this.userapi_key=localStorage.getItem('api_key')
      this.usercredit=localStorage.getItem('credit')
      
  }
  openDialogForEmail(){
const dialogg= this.dialog.open(ChangeEmailComponent,{
  
  })

  }

  openDialogForPassword(){
    const dialogp= this.dialog.open(ChangePasswordComponent,{})
  }
}
