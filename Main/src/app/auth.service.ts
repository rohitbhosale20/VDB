import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userEmail: string | null = null;
  private api_key: string | null = null;

  initGoogleAuth() {
    throw new Error('Method not implemented.');
  }
  signIn() {
    throw new Error('Method not implemented.');
  }
  signOut() {
    throw new Error('Method not implemented.');
  }
  private token: string | null = null;
  constructor() {}

  setToken(token: string | null): void {
    this.token = token;
    // Store the token in a cookie or local storage
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  setUserEmail(email: string | null): void {
    this.userEmail = email;
  }

  setapi_key(api_key: string | null): void {
    this.api_key = api_key;
  }

  getUserEmail(): string | null {
    return this.userEmail || localStorage.getItem('email');
  }

  getapi_key(): string | null {
    return this.api_key || localStorage.getItem('api_key');
  }

  getToken(): string | null {
    // Retrieve the token from a cookie or local storage
    return this.token || localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    // Check if the user is authenticated (e.g., token is present and not expired)
    return !!this.getToken();
  }

  logout(): void {
    // Clear user information and token
    this.token = null;
    localStorage.removeItem('auth_token');
  }























}
