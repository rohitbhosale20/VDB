import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { GuideComponent } from 'src/app/guide/guide.component';
import { FilterService } from 'src/app/mainpage/sidenavfolders/search/filters/filter.service';
import { GetDataService } from 'src/app/mainpage/sidenavfolders/search/people/get-data.service';

@Component({
  selector: 'app-right-side-for-companies',
  templateUrl: './right-side-for-companies.component.html',
  styleUrls: ['./right-side-for-companies.component.css']
})
export class RightSideForCompaniesComponent {
  filters: any = {};
  results: any = {};
  currentPage: number = 1;
  selectedRows: any[] = [];
  totalRecordsBeforeSearch: number = 0;
  totalRecordsAfterSearch: number = 0;
  count: any;
  loading: any;
  loadder: any;
  savedData: any;
  savedRecordsCount: any;
  private intervalidI!: number;
  Useremail: any;
  new_new: any;
  itemsPerPage: number = 50;
  displayedData!: any[] ;
  constructor(
    private router: Router,
    private apiService: GetDataService,
    private filterService: FilterService,
    private dialog:MatDialog
  ) {}

  ngOnInit(): void {
    this.fetchSavedData(this.currentPage);

    
    const userEmail = localStorage.getItem('email');
    // const userEmail = localStorage.getItem('email');
if (userEmail) {
  this.apiService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
    (response) => {
      console.log('Data saved successfully:', response);
      this.savedRecordsCount = response.saved_records_count;
      this.selectedRows = [];
    },
    (error) => {
      console.error('Error saving data:', error);
    }
  );
} 

  
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.fetchCountsBeforeSearch()
      this.search();
      // this.fetchTotalCountBeforeFiltering();
    });

    // this.intervalidI = window.setInterval(() => {
    //   // this.fetchTotalCountBeforeFiltering();
    // }, 1000);

// console.log('data count',this.savedRecordsCount);




  }

  fetchSavedData(page: number): void {
    this.apiService.getSavedDataForUser(page).subscribe({
      next: (response: any) => {
        console.log('Received data from the server:', response);
  
        if (response && response.saved_data) {
          this.savedData = response.saved_data;
          this.savedRecordsCount = +response.pagination_saved.total_pages_saved;
          this.getDataForCurrentPage(); // Call to set displayedData
        } else {
          console.warn('Unexpected server response. No saved_data property found.');
        }
      },
      error: (error) => {
        console.error('Error fetching saved data:', error);
      },
      complete: () => {
        console.log('Request completed. Saved data:', this.savedData);
      }
    });
  }
  isPeopleRoute(): boolean {
    const segments: string[] = this.router.url.split('/');
    return segments.includes('right');
  }
  fetchCountsBeforeSearch(): void {
    this.apiService.getCounts().subscribe((countData) => {
      this.totalRecordsBeforeSearch = countData.total_count;
      this.new_new = countData.net_new_count;
      console.log(this.totalRecordsBeforeSearch, 'totalRecordsBeforeSearch');
    });
  }
  // fetchTotalCountBeforeFiltering(): void {
  //   this.loading = true;
  //   this.apiService.searchRecords({}, 1).subscribe((data) => {
  //     this.totalRecordsBeforeSearch = data.total_records;
  //     this.loading = false;
  //   });
  // }
  search(): void {
    this.loading = false;
    // Check if any filters are applied
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
    console.log('Results:', this.results);
    console.log('Filters:', this.filters);
    this.loadder = filtersApplied;

    // Clear results and selectedRows when no filters are applied
    if (!filtersApplied) {
      this.results = [];
      this.selectedRows = [];

      return; // Exit the function early when no filters are applied
    }

    console.log(
      this.savedRecordsCount,
      'saved records count in right side component'
    );
    // Fetch total records before search
    this.apiService.searchRecords({}, 1).subscribe((data) => {
      // this.totalRecordsBeforeSearch = data.total_data
      ;
      console.log(this.totalRecordsBeforeSearch,'totalRecordsBeforeSearch');
      this.new_new=data.net_new_count
      console.log(data,'dataaa');
      
    });

    // Search and fetch results after search
    this.apiService
     .searchRecords(this.filters, this.currentPage)
    .subscribe((data) => {
        this.results = data;
        this.totalRecordsBeforeSearch=data.total_count
        // this.totalRecordsAfterSearch = data.total_records;
    //  this.count = data.total_records;
     console.log(this.totalRecordsBeforeSearch,'this.totalRecordsBeforeSearch');
     this.new_new=data.net_new_count
      });
   }

   openGuideDialog(){
    let dialogRef= this.dialog.open(GuideComponent,{
      data :{ },
        height: '1000px',
        width: '350px',
        position: { right: '0px', top: '90px',bottom:'0px' }
      });

  }


  getDataForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedData.length);
    this.displayedData = this.savedData.slice(startIndex, endIndex);
    console.log(this.displayedData.length,'displayedData');
    
  }
  }