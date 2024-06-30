import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { FilterService } from '../filters/filter.service';
import { StateService } from 'src/app/state.service';

@Component({
  selector: 'app-saved-list',
  templateUrl: './saved-list.component.html',
  styleUrls: ['./saved-list.component.css']
})
export class SavedListComponent { 
  dataofsaved: any[] = []; // Array to hold saved filters

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService,
    private filterService: FilterService
  ) { }

  ngOnInit(): void {
    this.getSavedFilters();
  }

  getSavedFilters() {
    const api_key = this.authService.getapi_key();
    const Url = `https://api.vectordb.app/v1/search/people/getSaveFilter/?api=${api_key}`;
    this.http.get(Url).subscribe(
      (res: any) => {
        console.log('Response from API:', res);
        this.dataofsaved = res; // Assuming API response is an array of objects with filter details
      },
      error => {
        console.error('Error fetching data:', error);
      }
    );
  }

  navigateToFilter(savedFilter: any): void {
    // Save the selected filters to local storage
    localStorage.setItem('savedFilters', JSON.stringify(savedFilter));

    // Example: Update filter service with selected filters
    this.filterService.updateFilters(savedFilter);

    // Navigate to the filter component or route
    this.router.navigate(['home/search/people/right/total']);
  }
}