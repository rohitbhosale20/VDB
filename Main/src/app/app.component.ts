import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SocialAuthService } from "@abacritt/angularx-social-login";
import { SocialUser } from "@abacritt/angularx-social-login";
import { LoadingBarService } from '@ngx-loading-bar/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { GetDataService } from './mainpage/sidenavfolders/search/people/get-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
title = 'demo';
user: any;
loggedIn: any;
authSubscription!: Subscription;
  constructor(private router:Router,private authService: SocialAuthService,private loadingBar: LoadingBarService,private getdataservice:GetDataService){
   }
   ngOnDestroy(): void {
    this.authSubscription.unsubscribe();
}
showHeaderB(){
  if (this.router.url.startsWith('/home')) {
    return true;
  } else {
    return false;
  }
}

ngOnInit() {
  this.authService.authState.subscribe((user) => {
    this.user = user;
    this.loggedIn = (user != null);
  });
  this.authSubscription = this.authService.authState.subscribe((user) => {
    console.log('user', user);
  });
}

// startLoading() {
//   this.loadingBar.start();
// }

// stopLoading() {
//   this.loadingBar.complete();
// }






googleWrapper:any

  
googleSignin(googleWrapper: any) {
  googleWrapper.click();
}

triggerGoogleSignin() {
  // Check if googleWrapper is defined and has a click method
  if (this.googleWrapper && typeof this.googleWrapper.click === 'function') {
    // Call the click method if googleWrapper is defined and has a click method
    this.googleWrapper.click();
  } else {
    console.error('googleWrapper is undefined or does not have a click method');
  }
}

}
