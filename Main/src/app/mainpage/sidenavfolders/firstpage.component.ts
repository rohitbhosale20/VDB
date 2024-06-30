import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { GetDataService } from './search/people/get-data.service';
import { ApexOptions } from 'apexcharts';
import { Chart, ChartComponent } from 'chart.js';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FilterService } from './search/filters/filter.service';
import { GuideComponent } from 'src/app/guide/guide.component';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';



export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-firstpage',
  templateUrl: './firstpage.component.html',
  styleUrls: ['./firstpage.component.css']
})
export class FirstpageComponent  implements OnInit{
  activityDuration: number = 7;
  chart!: ApexCharts;
  public chartOptions: Partial<ApexOptions> = {};
  public timestampData: any;
  results: any = {};
  currentPage: number = 1;
  selectedRows: any[] = [];
  totalRecordsBeforeSearch: number = 0;
  totalRecordsAfterSearch: number = 0;
  count: any;
  loading: any;
  loadder: any;
  savedData: any;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  userFirstName: any;
  userLastName: any;
  usercredit: any;
  private intervalidI!: number;
  Useremail: any;
  new_new: any;
  itemsPerPage: number = 50;
  displayedData!: any[];
  total_records = 0;
  savedSearchFilters: any[] = [];

  savedRecordsCount: any;
  filters: any;
  authService: any;
  http: any;
  dataofsaved: any;
  ngOnInit(): void {
    this.userFirstName = localStorage.getItem('firstName')
    this.userLastName=localStorage.getItem('lastName')
    this.usercredit=localStorage.getItem('credit')
    // this.renderChart();
    this.fetchTimestampData();
    this.fetchData();
    // this.renderAreaChart()
    this.fetchSavedData(this.currentPage);
    this.fetchSavedSearchFilters();
    this.getSavedFilters(); 
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      this.getDataService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
        (response: any) => {
          // this.savedRecordsCount = response.saved_records_count;

          this.selectedRows = [];
          console.log(this.savedRecordsCount,'savedrecodscount');
         
        },
        (error: any) => {
          console.error('Error saving data:', error);
        }
      );
    }

    this.filterService.filters$.subscribe((filters) => {
      this.filters = filters;
      this.fetchCountsBeforeSearch();
      this.search();
    });

  }

  navigateToFilter(savedFilter: any): void {
    // Save the selected filters to local storage or any other service
    localStorage.setItem('savedFilters', JSON.stringify(savedFilter));

    // Example: Update filter service with selected filters
    this.filterService.updateFilters(savedFilter);

    // Navigate to the filter component or route
    this.router.navigate(['home/search/people/right/total']);
  }
  getSavedFilters() {
    const api_key = this.authService.getapi_key();
    const Url = `https://api.vectordb.app/v1/search/people/getSaveFilter/?api=${api_key}`;
    this.http.get(Url).subscribe(
      (res: any) => {
        console.log('Response from API:', res);
        this.dataofsaved = res; // Assuming API response is an array of objects with filter details
      },
      (      error: any) => {
        console.error('Error fetching data:', error);
      }
    );  
  }

  fetchSavedSearchFilters(): void {
    this.getDataService.getSavedFilters().subscribe(
      (data: any[]) => {
        // Assuming data is an array of saved filters
        this.savedSearchFilters = data.slice(0, 3); // Get the three most recent filters
      },
      (error:any) => {
        console.error('Error fetching saved search filters:', error);
      }
    );
  }

  fetchSavedData(page: number): void {
    this.getDataService.getSavedDataForUser(page).subscribe({
      next: (response: any) => {
        if (response && response.saved_data) {
          // Assuming saved_data is an array of records with created_at timestamps
          this.savedData = response.saved_data;
          this.total_records = response.pagination_saved.total_records;
          
          // Sort savedData by created_at in descending order
          this.savedData.sort((a: any, b: any) => {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          });
  
          // Update displayedData with the recent 10 records
          this.displayedData = this.savedData.slice(0, 10);
        } else {
          console.warn('Unexpected server response. No saved_data property found.');
        }
      },
      error: (error) => {
        console.error('Error fetching saved data:', error);
      },
    });
  }
  
  
  

  getDataForCurrentPage(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.savedData.length);
    this.displayedData = this.savedData.slice(startIndex, endIndex);
  }
  chartSeries: any[] = [];
  constructor(private getDataService: GetDataService, private dialog: MatDialog,private snackbar:MatSnackBar,  private router: Router,   private filterService: FilterService,) {
    const userEmail = localStorage.getItem('email');

    console.log(userEmail,'useremail in firstpage');
   
    if (userEmail) {
      this.getDataService.saveDataToUserAccount(userEmail, this.selectedRows).subscribe(
        (response) => {
          this.savedRecordsCount = response.saved_records_count;
          this.selectedRows = [];
          console.log(this.savedRecordsCount,'saverecordscount');
         
        },
        (error) => {
          console.error('Error saving data:', error);
        }
      );
    }
 
   
  }

  fetchTimestampData(): void {
    this.getDataService.getTimestampData().subscribe(
      (data: any) => {
        this.timestampData = data;
        console.log(this.timestampData,'timestampdata in fecthtimestampData');
        this.chartOptions = {
          series: [
            {
              name: 'Timestamp Data',
              data: this.timestampData.map((item :any)=> item.date),
            }
          ],
          chart: {
            type: 'line',
            height: 350
          },
          xaxis: {
            categories: this.timestampData.map((item :any) => item.time),
          }
        };
      },
      (error: any) => {
        console.error('Error fetching timestamp data:', error);
      }
    );
  }

  fetchData() {
    this.getDataService.getTimestampData().subscribe(
      (data: any[]) => {
        this.timestampData = data;
        this.renderlineChart();
        this.renderAreaChart()
      },
      (error) => {
        console.error('Error fetching timestamp data:', error);
      }
    );
  }

  renderlineChart() {
    const labels = this.timestampData.map((item: any) => item.count);
    const series = this.timestampData.map((item: any) => item.date);
    const options = {
      series: [{
        name: 'Time',
        data: labels,
        labels: {
          formatter: function(value: string) {
            return value + ' hr';
          }
        }
      }],
      chart: {
        type: 'line', // Change the type to 'line'
        width: 900,
        height: 400,
        zoom: {
          enabled: false
        },
        fontFamily: 'Arial, sans-serif',
        background: ''
      },
      title: {
        text: "",
        align: "left"
      },
      animationEnabled: true,
      xaxis: {
        categories: series
      },
      colors: ['#ADD8E6'],
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      },
      legend: {
        position: 'right',
        fontSize: '22px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 330, // Adjust width for smaller screens
            height: 300 // Adjust height for smaller screens
          },
          legend: {
            position: 'right'
          }
        }
      }, {
        breakpoint: 480,
        options: {
          chart: {
            width: 500,
            height: 300
          }
        }
      },
      {
        breakpoint: 648,
        options: {
          chart: {
            width: 400,
            height: 300
          }
        }
      },
      {
        breakpoint: 967,
        options: {
          chart: {
            width: 500,
            height: 400
          }
        }
      },
      {
        breakpoint: 1077,
        options: {
          chart: {
            width: 800,
            height: 450
          }
        }
      },
      {
        breakpoint: 540,
        options: {
          chart: {
            width: 200,
            height: 300
          }
        }
      },
      {
        breakpoint: 468,
        options: {
          chart: {
            width: 190,
            height: 300
          }
        }
      }],
      tooltip: {
        enabled: true,
        style: {
          fontSize: '16px'
        },
        x: {
          show: true
        }
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        show: false, // This removes the background grid lines
      },
      stroke: {
        curve: "straight"
      },
      markers: {
        size: 0
      }
    };
    const chart = new ApexCharts(document.querySelector("#chart2"), options);
    chart.render();
  }
  show:boolean=true
  opensnack(){
    this.snackbar.open('Thanks for your feedback','',{duration:1000})
    this.show=false
  }
 
  renderAreaChart() {
    const labels = this.timestampData.map((item: any) => item.count);
    const series = this.timestampData.map((item: any) => item.date);
    const options = {
      series: [{
        name: 'Saved Count Over Time',
        data: labels
      },  ],
      chart: {
        type: 'area',
        height: 400,
        zoom: {
          enabled: true
        },
        fontFamily: 'Arial, sans-serif',
        background: ''
      },
      title: {
        text: "Saved Count",
        align: "left"
      },
      xaxis: {
        categories: series
      },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.9,
          stops: [0, 90, 100]
        }
      },
      colors: ['#ADD8E6', '#87CEEB', '#B0C4DE'],
      style: {
        fontSize: '14px',
        fontWeight: 'bold'
      },
      legend: {
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '14px'
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: '16px'
        },
        x: {
          show: true
        }
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        show: true,
        borderColor: '#e7e7e7',
        strokeDashArray: 4,
      },
      stroke: {
        curve: "smooth"
      },
      markers: {
        size: 4,
        colors: ['#fff'],
        strokeColors: '#000',
        strokeWidth: 2,
      }
    };
 
    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }

  metrics = [
    { label: 'User', value: 798, icon: 'user', trend: 'steady', color: 'yellow' },
    { label: 'Session', value: 486, icon: 'session', trend: 'down', color: 'red' },
    { label: 'Page view', value: 9454, icon: 'pageview', trend: 'steady', color: 'pink' },
    { label: 'Page / Session', value: 7.15, icon: 'pagesession', trend: 'steady', color: 'purple' },
    { label: 'Avg. Session Time', value: '00:04:30', icon: 'sessiontime', trend: 'steady', color: 'blue' },
    { label: 'Bounce Rate', value: '1.55%', icon: 'bouncerate', trend: 'steady', color: 'green' }
  ];
  orbitImages = [
    { src: 'assets/center-image.png', alt: 'Image 1' },
    { src: './assets/hero-abs-2.png', alt: 'Image 2' },
    { src: './assets/hero-abs-2.png', alt: 'Image 3' },
    { src: './assets/hero-abs-2.png', alt: 'Image 4' },
    { src: './assets/hero-abs-2.png', alt: 'Image 5' },
  ];



  isPeopleRoute(): boolean {
    const segments: string[] = this.router.url.split('/');
    return segments.includes('right');
  }

  fetchCountsBeforeSearch(): void {
    this.getDataService.getCounts().subscribe((countData) => {
      this.totalRecordsBeforeSearch = countData.total_count;
      this.new_new = countData.net_new_count;
      console.log('count from VDB API - ', this.new_new);
    });
  }

  search(): void {
    this.loading = true;
    const filtersApplied = Object.values(this.filters).some(
      (value) => value !== null && value !== undefined && value !== ''
    );

    this.loadder = filtersApplied;

    if (!filtersApplied) {
      this.results = [];
      this.selectedRows = [];
      this.loading = false;
      return;
    }

    this.getDataService.searchRecords({}, 1).subscribe((data) => {
      this.totalRecordsBeforeSearch = data.total_count;
    });

    this.getDataService.searchRecords1(this.filters, this.currentPage).subscribe((data) => {
      this.new_new = data.net_new_count;
    });

    this.getDataService.searchRecords(this.filters, this.currentPage).subscribe((data) => {
      this.results = data;
      this.totalRecordsBeforeSearch = data.total_count;
      this.new_new = data.net_new_count;
      this.loading = false;
      console.log('count from VDB API after search - ', this.new_new);
    });
  }

  openGuideDialog() {
    let dialogRef = this.dialog.open(GuideComponent, {
      data: {},
      height: '500px',
      width: '350px',
      position: { right: '150px', top: '290px', bottom: '0px' },
    });
  }
}