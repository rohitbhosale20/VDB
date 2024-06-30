import { GetDataService } from '../get-data.service';
import { Component, Inject } from '@angular/core';
import saveAs from 'file-saver';
import { FilterService } from '../../filters/filter.service';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UserDetailsComponent } from './user-details/user-details.component';
import { Router } from '@angular/router';
import { FilterCompaniesService } from 'src/app/filter-companies/filter-companies.service';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { LoginComponent } from 'src/app/landingpage/login/login.component';
import { JoyrideService } from 'ngx-joyride';
import { GuideComponent } from 'src/app/guide/guide.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmailValidator } from '@angular/forms';
import {
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { EmaildialogueComponent } from 'src/app/emaildialogue/emaildialogue.component';
import { ServiceForemailverificationService } from 'src/app/service-foremailverification.service';
import { NewService } from 'src/app/new.service';
import { callback } from 'chart.js/dist/helpers/helpers.core';
import { DialogueSaveComponent } from 'src/app/dialogue-save/dialogue-save.component';
@Component({
  selector: 'app-total',
  templateUrl: './total.component.html',
  styleUrls: ['./total.component.css'],
})
export class TotalComponent {
  filters: any = {};
  results: any = [];
  currentPage: number = 1;
  loading = true;
  selectedRows: any[] = [];
  count: any;
  // isLoading: boolean = true;
  selectedUserDetails?: any = null;
  dialogRef: any;
  progressValue: number = 0;
  userEmail: string = '';
  pagination: any = {};
  paginationTotal: any = {};
  recordsPerPage: number = 10;
  totalPages: number = 0;
  items: any;
  loader:any
  isLoading:boolean=true
  constructor(
    private apiService: GetDataService,
    private emailVerificationService: ServiceForemailverificationService,
    private readonly joyrideService: JoyrideService,
    private snackBar: MatSnackBar,
    private filterService: FilterService,
    private dialog: MatDialog,
    private router: Router,
    private loadingBar: LoadingBarService,
    private validationService:NewService
  ) {}
  ngOnInit(): void {
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.startProgressBar();
      this.search();
    });
    this.saveDataToUserAccount();
    this.filters = this.retrieveFiltersFromLocal();
  }

  onUserNameClick(prospectLink: string): void {
    this.fetchAllDetailsForUser(prospectLink);
  }

  fetchAllDetailsForUser(prospectLink: string): void {
    this.apiService.getAllDetailsForUser(prospectLink).subscribe(
      (data) => {
        this.selectedUserDetails = data.userDetails;
       
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  openUserDetails(prospectLink: string): void {
    // Navigate to the userDetails route with the prospectLink as a parameter
    this.router.navigate(['userDetails', prospectLink]);
  }
  saveData(): void {
    console.log('Selected Rows in Component:', this.selectedRows);
  
    this.apiService.saveDataToUserAccount1(this.selectedRows)
      .subscribe(
        (response) => {
          console.log('Response:', response);
          this.selectedRows = []; // Clear selected rows on successful save
          // Optionally, show success message or perform other actions
          this.snackBar.open('Data saved successfully','',{
          duration:1000
          }
          )
        },
        (error) => {
          console.error('Error:', error);
          if (error.status === 409) {
            // Handle duplicate entry error
          } else if (error.status === 500) {
            // Handle other server errors
          } else {
            // Handle other specific errors as needed
          }
        }
      );
  }
  
  search(): void {
    this.loading = true;
    // this.isLoading = false;
  
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
    console.log('applied Filters:', this.filters);
  
    if (!filtersApplied) {
      this.results = [];
      this.progressValue = 0;
    
   this.startProgressBar(); 
      this.isLoading = false;
      this.selectedRows = [];
      return;
    }
  
    this.apiService.searchRecords(this.filters, this.currentPage).subscribe(
      (data: any) => {
        this.results = data.total_data;
  
        this.loading = false;
        this.count = data.total_count;
  
        this.totalPages = data.pagination_total.total_pages_total;
        this.paginationTotal = this.calculatePaginationDetails(
          this.currentPage,
          data.total_count
        );
  
        // Save filters to local storage after fetching results
        this.saveFiltersToLocal();

        // Retrieve filters from local storage and log them
        console.log('Retrieved Filters:', this.retrieveFiltersFromLocal());
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.loading = false;
    
      }
    );
  }

  // Function to save filters to local storage
  saveFiltersToLocal(): void {
    localStorage.setItem('appliedFilters', JSON.stringify(this.filters));
  }
  
  // Function to retrieve filters from local storage
  retrieveFiltersFromLocal(): any {
    const storedFilters = localStorage.getItem('appliedFilters');
    return storedFilters ? JSON.parse(storedFilters) : {};
  }
  

  
  calculatePaginationDetails(currentPage: number, totalItems: number): any {
    const totalPages = Math.ceil(totalItems / this.recordsPerPage);
  
    return {
      current_page_total: currentPage,
      total_pages_total: totalPages,
      records_per_page_total: this.recordsPerPage,
    };
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.search();
    }
  }
  
  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(this.currentPage - Math.floor(maxVisiblePages / 2), 1);
    let endPage = startPage + maxVisiblePages - 1;
  
    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(endPage - maxVisiblePages + 1, 1);
    }
  
    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }
  
    return pages;
  }
  
  toggleRowSelection(row: any): void {
    const index = this.selectedRows.findIndex(
      (selectedRow) => selectedRow.prospect_Link === row.prospect_Link
    );
  
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }
  

  isRowSelected(row: any): boolean {
    return this.selectedRows.some(
      (selectedRow) => selectedRow.prospect_Link === row.prospect_Link
    );
  }
  exportToCSV(): void {
    const api_key = localStorage.getItem('api_key');
    if (api_key) {
      const filters = this.filters;
      const selectedRows = this.selectedRows;
  
      this.apiService.exportToCSV(filters, selectedRows).subscribe(
        (data) => {
          const blob = new Blob([data], { type: 'text/csv;charset=utf-8' });
          saveAs(blob, 'exported_data.csv');
          this.snackBar.open('Data has been exported', 'Close', {
            duration: 4000,
            verticalPosition: 'top',
            panelClass: ['custom-snackbar', 'snackbar-success'],
          });
        },
        (error) => {
          console.error('Error exporting data:', error);
        }
      );
    } else {
      console.error('User API key not found.');
    }
  }
  

  saveDataToUserAccount(): void {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.apiService
        .saveDataToUserAccount(userEmail, this.selectedRows)
        .subscribe(
          (response) => {
       

            this.selectedRows = [];
            this.snackBar.open('record save ', 'Close', {
              duration: 2000,
             
            });
          },
          (error) => {
            if (error.status === 501) {
              console.error('Connection failed', error);
            } else if (error.status === 409 ) {
              this.snackBar.open('Already saved record', 'Close', {
                duration: 1000,
               
              });
            }
          }
        );
    } else {
      console.error('User email not found.');
    }
  }

  selectAllChecked: boolean = false;

  selectAllRows(): void {
    this.selectAllChecked = !this.selectAllChecked;

    if (this.selectAllChecked) {
      this.selectedRows = [...this.results];
    } else {
      this.selectedRows = [];
    }
  }

  openUserDialog(editData: any) {
    let dialogRef = this.dialog.open(UserDetailsComponent, {
      data: { editData },
      height: '100%',
      width: '450px',
      position: { right: '0px', top: '320px', bottom: '100px' },
    });
  }
  

  openExportDialogue(): void {
    const dialogRef = this.dialog.open(DialogueSaveComponent, {
      data: { selectedRows: this.selectedRows }, // Pass selectedRows to the dialog
      position: { right: '100px', top: '320px', bottom: '100px', left: '200px' },
    })
  }
  startProgressBar() {
    const interval = setInterval(() => {
      if (this.progressValue < 100) {
        this.progressValue += 50;
      } else {
        clearInterval(interval);
        // callback(); // Execute the callback function when progress reaches 100%
      }
    }, 1000);
  }
  
  openGuideDialog() {
    let dialogRef = this.dialog.open(GuideComponent, {
      data: {},
      height: '500px',
      width: '450px',
      position: { right: '0px', top: '90px', bottom: '0px' },
    });
  }

  localStorage = localStorage;
  valitity: any;
  clicked: any;
  isEmailValid: any;
  showSelected: boolean = false;
  validationChecked: boolean = false;
  showButton: boolean = true;

  validateEmail(email: string, item: any): void {
   
    this.apiService.getlastBounce(email).subscribe(
      (data) => {
        console.log(data.result, 'data of rebounce');
        this.isEmailValid = data.result;
        item.isValidEmail = data.result;
        item.clicked = true;

        // Store the verification status in localStorage
        localStorage.setItem(
          'emailVerification_' + email,
          JSON.stringify({ isValidEmail: data.result, clicked: true })
        );
        this.valitity = localStorage.getItem('isValidEmail');
        this.clicked = localStorage.getItem('clicked');
        this.showResult = true;
      },
      (error: any) => {
        console.error('Error validating email:', error);
        this.snackBar.open('Error occurred while validating email', 'Close', {
          duration: 4000,
          verticalPosition: 'top',
          panelClass: ['custom-snackbar', 'snackbar-error'],
        });
      }
    );
  }

  // Method to retrieve the stored validation status for an email from localStorage
  getStoredValidationStatus(email: string): string | null {
    const storedData = localStorage.getItem('emailVerification_' + email);
    if (storedData) {
      const { isValidEmail } = JSON.parse(storedData);
      return isValidEmail;
    }
    return 'VALID'
  }
  showResult: boolean = false;



  status!: string;
  buttonClicked: boolean = false;
  checkStatus(email: string) {
    
    this.apiService.searchRecords(this.filters, this.currentPage).subscribe(
      (data: any) => {
        this.status = data.email_validation
   
 
      this.buttonClicked = true;
   
    });
  }


  
}