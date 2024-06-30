import { Component, EventEmitter, NgZone, OnInit, Output, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GetDataService } from 'src/app/mainpage/sidenavfolders/search/people/get-data.service';
import { AuthService } from 'src/app/auth.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';

declare global {
  interface Window {
    google: any;
  }
}
declare var google :any
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loading: boolean = true;
  myReactiveForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private ngZone: NgZone,
    private apiService: GetDataService,
    private snackbar: MatSnackBar,
    private authService: AuthService,
    private router: Router
  ) {
    this.myReactiveForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    window.addEventListener('load', () => {
      this.loading = false;
    });

    this.authService.initGoogleAuth();
    const rememberMe = localStorage.getItem('rememberMe');
    if (rememberMe !== null) {
      this.myReactiveForm.patchValue({ rememberMe: JSON.parse(rememberMe) });
    }
  }
  show=true

  onSubmit() {
    
      const emailControl = this.myReactiveForm.get('email');
      const passwordControl = this.myReactiveForm.get('password');
    
      if (emailControl && passwordControl && emailControl.valid && passwordControl.valid) {
        this.apiService.loginUser(this.myReactiveForm.value).subscribe(
          (response: any) => {
            if (response.token && response.user) {
              localStorage.setItem('rememberMe', JSON.stringify(this.myReactiveForm.value.rememberMe));
              localStorage.setItem('email', response.user.email);
              localStorage.setItem('firstName', response.user.firstName);
              localStorage.setItem('lastName', response.user.lastName);
              localStorage.setItem('api_key', response.user.api_key);
              localStorage.setItem('credit', response.user.credit);
    
              this.snackbar.open('You have logged in successfully', 'Close', {
                duration: 4000,
              });
              this.router.navigate(['home']);
            } else {
              console.error('Invalid response format:', response);
              this.snackbar.open('Invalid response from server. Please try again later.', 'Close', {
                duration: 4000,
              });
            }
          },
          (error) => {
            console.error('Error occurred during login:', error);
            if (error.status === 401) {
              this.snackbar.open('Invalid email or password. Please try again.', 'Close', {
                duration: 4000,
              });
            } else if (error.status === 404) {
              this.snackbar.open('User not found. Please register or check your credentials.', 'Close', {
                duration: 4000,
              });
            } else {
              this.snackbar.open('An error occurred. Please try again later.', 'Close', {
                duration: 4000,
              });
            }
          }
        );
      } else {
        this.myReactiveForm.markAllAsTouched();
        this.snackbar.open('Please enter a valid email and password.', 'Close', {
          duration: 4000,
        });
      }
    }
    

  // handleLogin1(respon: any) {
  //   if (respon) {
  //     const payload = this.decodeToken1(respon.credential);
  //     sessionStorage.setItem("loggedInUser", JSON.stringify(payload));
  //     const userData = {
  //       email: payload.email,
  //       firstName: payload.given_name,
  //       lastName: payload.family_name,
  //     };
  //     this.apiService.loginUser(userData).subscribe(
  //       (registrationResponse: any) => {
  //         console.log('User registered successfully:', registrationResponse);
  //       },
  //       (error: any) => {
  //         console.error(error);
  //       }
  //     );
  //     this.ngZone.run(() => {
  //       this.router.navigate(['home/firstPage']);
  //     });
  //   }
  // }
}