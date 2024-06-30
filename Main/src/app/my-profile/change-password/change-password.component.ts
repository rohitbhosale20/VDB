import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GetDataService } from 'src/app/mainpage/sidenavfolders/search/people/get-data.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  resetPasswordForm: FormGroup;
  hide = true;
  hideNew = true;
  showResetPasswordForm = false;

  constructor(
    private fb: FormBuilder,
    private apiService: GetDataService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
    });
  }
  resetPassword() {
    if (this.resetPasswordForm.valid) {
      const { email, currentPassword, newPassword } = this.resetPasswordForm.value;
  
      const requestData = {
        email,
        currentPassword,
        newPassword,
      };
  
      this.apiService.resetPassword(requestData)
        .subscribe(
          (response: any) => {
            console.log('Password reset response:', response);
  
            if (response && response.includes('Password updated successfully')) {
              this.snackbar.open('Password updated successfully', 'Close', {
                duration: 4000,
              });
  
              // Optionally, you might want to reset the form or perform any other actions.
              this.resetPasswordForm.reset();
              this.showResetPasswordForm = false;
            } else {
              // Handle unexpected response format
              console.error('Unexpected response format:', response);
              this.snackbar.open('An error occurred. Please try again later.', 'Close', {
                duration: 4000,
              });
            }
          }
        );
    } else {
      this.resetPasswordForm.markAllAsTouched();
      this.snackbar.open('Please enter a valid email and new password.', 'Close', {
        duration: 4000,
      });
    }
  }
  
  
}
