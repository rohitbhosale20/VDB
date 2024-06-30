import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataService } from '../get-data.service';
import { FilterService } from '../../filters/filter.service';
import { MatDialog } from '@angular/material/dialog';
import { GuideComponent } from 'src/app/guide/guide.component';

@Component({
  selector: 'app-rigth-sidenetnew-saved-total',
  templateUrl: './rigth-sidenetnew-saved-total.component.html',
  styleUrls: ['./rigth-sidenetnew-saved-total.component.css'],
})
export class RigthSidenetnewSavedTotalComponent implements OnInit {
  filters: any = {};
  currentPage: number = 1;
  selectedRows: any[] = [];
  savedRecordsCount: number = 0;
  net_new_count: number = 0;
  total_count: number = 0;
  savedData: any;
  total_records = 0;
  itemsPerPage: number = 50;
  // displayedData: any[];

  private currentFilters: any = {}; // Variable to store current filters
  displayedData: any;
  total_count1: any;
  net_new_count1: any;

  constructor(
    private router: Router,
    private apiService: GetDataService,
    private filterService: FilterService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSavedData(this.currentPage);
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.apiService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
        (response) => {
          this.savedRecordsCount = response.saved_records_count;
          this.selectedRows = [];
          console.log('Saved records in firstpage', this.savedRecordsCount);
        },
        (error) => {
          console.error('Error saving data:', error);
        }
      );
    }

    // Subscribe to filter changes
    this.filterService.filters$.subscribe((filters) => {
      if (!this.filtersAreEqual(filters, this.currentFilters)) {
        this.currentFilters = filters;
        this.fetchCounts(); // Refresh counts with new filters
      }
    });
  }

  fetchSavedData(page: number): void {
    this.apiService.getSavedDataForUser(page).subscribe({
      next: (response: any) => {
        if (response && response.saved_data) {
          this.savedData = response.saved_data;
          this.total_records = response.saved_data.total_records;
          this.savedRecordsCount = +response.pagination_saved.total_records;
          this.getDataForCurrentPage();
        } else {
          console.warn('Unexpected server response. No saved_data property found.');
        }
      },
      error: (error) => {
        console.error('Error fetching saved data:', error);
      },
    });
  }

  isPeopleRoute(): boolean {
    const segments: string[] = this.router.url.split('/');
    return segments.includes('right');
  }

  getDataForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedData.length);
    this.displayedData = this.savedData.slice(startIndex, endIndex);
  }

  fetchTotalCount(filters: any): void {
    this.apiService.searchRecords(filters).subscribe((count) => {
      this.total_count = count.total_count;
    });
  }

  fetchNetNewCount(filters: any): void {
    this.apiService.searchRecords1(filters).subscribe((count) => {
      this.net_new_count = count.net_new_count;
    });
  }

  // Helper method to compare filters
  private filtersAreEqual(filters1: any, filters2: any): boolean {
    // Implement your comparison logic here based on your filter structure
    // Example: return JSON.stringify(filters1) === JSON.stringify(filters2);
    return false; // Placeholder, implement based on your actual filter structure
  }

  openGuideDialog() {
    let dialogRef = this.dialog.open(GuideComponent, {
      data: {},
      height: '500px',
      width: '350px',
      position: { right: '150px', top: '290px', bottom: '0px' },
    });
  }

  fetchCounts(): void {
  this.fetchTotalCount(this.currentFilters);
  this.fetchNetNewCount(this.currentFilters);
  this.fetchSavedCount(this.currentFilters);
}

fetchSavedCount(filters: any): void {
  this.apiService.searchRecords(filters).subscribe((response) => {
    if (response && response.saved_count && response.total_count && response.net_new_count) {
      this.savedRecordsCount = response.saved_count;
       this.total_count1 = response.total_count;
        this.net_new_count1 = response.net_new_count;
    } else {
      console.warn('Unexpected server response. No saved_count property found.');
    }
  });
}

}
