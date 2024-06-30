import { Component } from '@angular/core';
import { FilterService } from '../filters/filter.service';
import { GetDataService } from '../people/get-data.service';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent {
  filters: any = {};
  results: any = [];
  currentPage: number = 1;
  Useremail:any
  constructor(private apiService: GetDataService, private filterService: FilterService) {}

  ngOnInit(): void {
    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.search();
    });

    this.search();
  }

  search(): void {
    this.apiService.searchRecords(this.filters, this.currentPage).subscribe((data) => {
      this.results = data;
    });
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.results.total_pages) {
      this.currentPage = page;
      this.search();
    }
  }
}
