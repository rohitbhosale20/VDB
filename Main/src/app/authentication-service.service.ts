import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationServiceService {

  private isAuthenticated = false;

  constructor() {}

  login() {
    // Logic to handle user login
    this.isAuthenticated = true;
  }

  logout() {
    // Logic to handle user logout
    this.isAuthenticated = false;
  }

  isLoggedIn() {
    return this.isAuthenticated;
  }
}
