import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoadingBarService } from '@ngx-loading-bar/core';

import { JoyrideService } from 'ngx-joyride';
import saveAs from 'file-saver';
import { GetDataService } from '../mainpage/sidenavfolders/search/people/get-data.service';
import { NewService } from '../new.service';
import { ServiceForemailverificationService } from '../service-foremailverification.service';
import { FilterService } from '../mainpage/sidenavfolders/search/filters/filter.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-dialogue-save',
  templateUrl: './dialogue-save.component.html',
  styleUrls: ['./dialogue-save.component.css']
})
export class DialogueSaveComponent {
  filters: any;
  selectedRows: any[] = [];
  isDataSaved: boolean = false; // Flag to track if data is saved

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private apiService: GetDataService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<DialogueSaveComponent>,
  ) {
    if (this.data && this.data.selectedRows) {
      this.selectedRows = this.data.selectedRows; // Initialize selectedRows with passed data
    }
  }

  saveData(): void {
    console.log('Selected Rows in Component:', this.selectedRows);

    this.apiService.saveDataToUserAccount1(this.selectedRows)
      .subscribe(
        (response) => {
          console.log('Response:', response);
          this.isDataSaved = true; this.snackBar.open('Record Saved', 'Close', {
            duration: 2000,
            verticalPosition: 'top',
            panelClass: 'my-custom-snackbar',
          });
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

  exportToCSV(): void {
    const api_key = this.authService.getapi_key();

    if (this.selectedRows.length === 0) {
      this.snackBar.open('No rows selected for export', 'Close', {
        duration: 4000,
        verticalPosition: 'top',
        panelClass: ['custom-snackbar', 'snackbar-warning'],
      });
      return;
    }

    const filters = this.filters;

    this.apiService.exportToCSV(filters, this.selectedRows).subscribe(
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
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

 

