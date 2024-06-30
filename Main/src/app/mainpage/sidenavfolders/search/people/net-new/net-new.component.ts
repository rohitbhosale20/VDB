import { Component } from '@angular/core';
import { UserDetailsComponent } from '../total/user-details/user-details.component';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FilterService } from '../../filters/filter.service';
import { GetDataService } from '../get-data.service';
import saveAs from 'file-saver';
import { LoadingBarService } from '@ngx-loading-bar/core';
import { JoyrideService } from 'ngx-joyride';
import { GuideComponent } from 'src/app/guide/guide.component';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserDetailsForNetnewComponent } from 'src/app/user-details-for-netnew/user-details-for-netnew.component';
import { DialogueSaveComponent } from 'src/app/dialogue-save/dialogue-save.component';
@Component({
  selector: 'app-net-new',
  templateUrl: './net-new.component.html',
  styleUrls: ['./net-new.component.css']
})
export class NetNewComponent {
  filters: any = {}; 
  results: any = [];
  currentPage: number = 1;
  loading = true;
  selectedRows: any[] = [];
  count:any
  isLoading: boolean = true;
  selectedUserDetails?: any = null;
  dialogRef: any;
  progressValue: number = 0;
  userEmail: string = '';
  pagination: any = {};
  paginationTotal: any = {}; 
  recordsPerPage: number = 10; 
  totalPages: number = 0;
 
  private filterSubscription: Subscription;

  constructor(
    private apiService: GetDataService,
    private readonly joyrideService: JoyrideService,
    private filterService: FilterService,
    private dialog: MatDialog,
    private router: Router,
    private loadingBar: LoadingBarService,
    private authService: AuthService ,
    private snackbar:MatSnackBar
  ) {
    this.filterSubscription = this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.startProgressBar();
      this.search();
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.saveDataToUserAccount();
    this.search();
    console.log(this.prospectlink,'prospectlink');
    
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
    this.router.navigate(['userDetails', prospectLink]);
  }

  search(): void {
    this.loading = true;
    this.startProgressBar();
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );
  
    if (!filtersApplied) {
      this.results = [];
      this.startProgressBar();
      this.selectedRows = [];
      return;
    }
  
    this.apiService
      .searchRecords(this.filters, this.currentPage)
      .subscribe(
        (data: any) => {
          this.results = data.net_new_data;
          this.loading = false;
          // this.count = data.net_new_count;
          this.isLoading = false;
          this.totalPages = parseInt(data.net_new_pagination.total_pages_net_new, 50); // Convert pagination_total to number
          
          console.log(this.results, 'this is the results in net new');
  
          this.totalPages = data.net_new_pagination.total_pages_net_new;
          this.paginationTotal = this.calculatePaginationDetails(
            this.currentPage,
            data.net_new_count_count
          );
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.loading = false; 
        }
      );   
  }
  

  calculatePaginationDetails(currentPage: number, totalItems: number): any {
    const totalPages = Math.ceil(totalItems / this.recordsPerPage);
  
    return {
      current_page_total: currentPage,
      pagination_total: totalPages,
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
    const index = this.selectedRows.findIndex((selectedRow) => selectedRow.prospect_Link === row.prospect_Link);
    if (index === -1) {
      this.selectedRows.push(row);
    } else {
      this.selectedRows.splice(index, 1);
    }
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.some((selectedRow) => selectedRow.prospect_Link === row.prospect_Link);
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
          this.snackbar.open('Data has been exported', 'Close', {
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
  
  dataSaved: boolean = false;

  
  saveDataToUserAccount(): void {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.apiService
        .saveDataToUserAccount(userEmail, this.selectedRows)
        .subscribe(
          (response) => {
       

            this.selectedRows = [];
          },
          (error) => {
            if (error.status === 501) {
              console.error('Connection failed', error);
            } else if (error.status === 409 ||500) {
              this.snackbar.open('Already saved record', 'Close', {
                duration: 4000,
                verticalPosition: 'top',
                panelClass: 'my-custom-snackbar',
              });
            }
          }
        );
    } else {
      console.error('User email not found.');
    }
  }

  enableExportButton(): void {
    // Assuming there's a flag to indicate whether the data has been saved
    this.dataSaved = true;
  }
   prospectlink:any
  toggleValidation(item: any): void {
    item.loading = true; // Show loader
  
    // Simulate validation process, replace this with your actual validation logic
    setTimeout(() => {
      // Assuming validation is successful and the result is stored in item.email_validation
      item.showValidation = true;
      item.loading = false; // Hide loader
  
      // If email is valid, save data to user account
      if (item.email_validation) {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
          const api_key = this.authService.getapi_key();
          const selectedRowId = item.prospect_Link; // Assuming Prospect_Link is the selected row ID
  console.log(item.prospect_Link,'prospect link.... in net new');
  this.prospectlink=item.prospect_Link
          // Populate selectedRows array
          this.selectedRows = [item]; // Assuming only one item is selected at a time
  
          // Construct API URL
          const apiUrl = `https://api.vectordb.app/v1/search/people/savedata/?api=${api_key}&selectedRowIds[]=${selectedRowId}`;
  
          // Make request to save data
          this.apiService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
            (response) => {
              
             this.snackbar.open('Email access successfully')
            },
            (error) => {
              // Handle error if needed
              console.error('Error saving data:', error);
            }
          );
        } else {
          console.error('User email not found.');
        }
      }
    }, 2000); // Simulate 2 seconds delay, adjust as needed
  }
  
  
  
  saveData(): void {
    console.log('Selected Rows in Component:', this.selectedRows);
  
    this.apiService.saveDataToUserAccount1(this.selectedRows)
      .subscribe(
        (response) => {
          console.log('Response:', response);
          this.selectedRows = []; // Clear selected rows on successful save
          // Optionally, show success message or perform other actions
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
  
  openExportDialogue(): void {
    const dialogRef = this.dialog.open(DialogueSaveComponent, {
      data: { selectedRows: this.selectedRows }, // Pass selectedRows to the dialog
      position: { right: '100px', top: '320px', bottom: '100px', left: '200px' },
    })
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
    let dialogRef = this.dialog.open(UserDetailsForNetnewComponent, {
      data: { editData },
      height: '100%',
      width: '450px',
      position: { right: '0px', top: '320px', bottom: '100px' },
    });
  }

  startProgressBar() {
    const interval = setInterval(() => {
      if (this.progressValue < 100) {
        this.progressValue += 50; 
      } else {
        clearInterval(interval);
      }
    }, 1000); 
  }

  openGuideDialog() {
    let dialogRef = this.dialog.open(GuideComponent,{
      data: { },
      height: '1000px',
      width: '450px',
      position: { right: '0px', top: '90px', bottom:'0px' }
    });
  }

  valitity: any;
  clicked: any;
  isEmailValid: any;
  showSelected: boolean = false;
  validationChecked: boolean = false;
  showButton: boolean = true;

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.refreshComponent();
  }

  refreshComponent(): void {
    this.selectedRows = [];
    this.loading = true;
    this.isLoading = true;
    this.search();
  }
}