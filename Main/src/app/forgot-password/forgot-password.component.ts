import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetDataService } from '../mainpage/sidenavfolders/search/people/get-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm!: FormGroup ;
  resetPasswordForm!: FormGroup;
  hide = true;
  hideNew = true;
  show=true
  loading: boolean = true;
  showResetPasswordForm = false;
  constructor(
    private formBuilder: FormBuilder,
    private forgotPasswordService: GetDataService,
    private snackBar: MatSnackBar , private router: Router,
  ) { 
     }

  
  ngOnInit(): void {
    this.resetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
    });
  }

  // resetPassword() {
  //   if (this.forgotPasswordForm.invalid) {
  //     return;
  //   }

  //   const email = this.forgotPasswordForm.value.email;
  //   this.forgotPasswordService.resetPassword(email).subscribe(
  //     () => {
  //       this.snackBar.open('Password reset email sent successfully.', 'Close', {
  //         duration: 5000,
  //       });
  //       // Optionally, you can redirect the user to a login page or a confirmation page.
  //     },
  //     (error:any) => {
  //       console.error('Error occurred during password reset:', error);
  //       let errorMessage = 'An error occurred. Please try again later.';
  //       if (error.status === 404) {
  //         errorMessage = 'User not found. Please check your email address.';
  //       }
  //       this.snackBar.open(errorMessage, 'Close', {
  //         duration: 5000,
  //       });
  //     }
  //   );
  // }














  resetPassword() {
    if (this.resetPasswordForm.valid) {
      this.show=false
      this.loading = true;
      const { email, currentPassword, newPassword } = this.resetPasswordForm.value;
  
      const requestData = {
        email,
        currentPassword,
        newPassword,
      };
  
      this.forgotPasswordService.resetPassword(requestData)
        .subscribe(
          (response: any) => {
            console.log('Password reset response:', response);
  
            if (response && response.includes('Password updated successfully')) {
              this.snackBar.open('Password updated successfully', 'Close', {
                duration: 4000,
              });
  
              // Optionally, you might want to reset the form or perform any other actions.
              this.resetPasswordForm.reset();
              this.showResetPasswordForm = false;
            } else {
              // Handle unexpected response format
              console.error('Unexpected response format:', response);
              this.snackBar.open('An error occurred. Please try again later.', 'Close', {
                duration: 4000,
              });
            }
          }
        );
    } else {
      this.resetPasswordForm.markAllAsTouched();
      this.snackBar.open('Please enter a valid email and new password.', 'Close', {
        duration: 4000,
      });
    }
  }
  


}
