import { Component, ViewChild } from '@angular/core';
import * as ApexCharts from 'apexcharts';
import { GetDataService } from '../mainpage/sidenavfolders/search/people/get-data.service';

declare var google: any;
@Component({
  selector: 'app-data-enrichment',
  templateUrl: './data-enrichment.component.html',
  styleUrls: ['./data-enrichment.component.css']
})
export class DataEnrichmentComponent {
  topCountriesData: any[] = [];
  topJobTitlesData: any[] = [];
  public selectionType!: string;
  public data: any;
  

  constructor(private getDataService: GetDataService) { }
  
  ngOnInit(): void {
    this.fetchTopCountriesData();
    this.fetchTopJobTitlesData();
    this.loadGoogleCharts();
    this.fetchData()
    this.loadGoogleCharts2()
    this.fetchData2()
  }




  fetchTopCountriesData() {
    this.getDataService.getTopCountriesData().subscribe(
      (data: any[]) => {
        this.topCountriesData = data;
        
        console.log(data,' data');
       
        this.renderPieChart(); 
      },
      (error) => {
        console.error('Error fetching top countries data:', error);
      }
    );
  }

  renderPieChart() {
    const labels = this.topCountriesData.map(countryData => countryData.country);
    const series = this.topCountriesData.map(countryData => countryData.count);

    const newSeries = series;
    const newLabels = labels; 
  console.log(newSeries,'newseriex in render');
  
  
    const options = {
      series: newSeries,
      chart: {
        type: 'pie',
        width: 400,
        height: 300,
        fontFamily: 'Arial, sans-serif', 
        background: '#f5f5f5'
      },
      
      fill: {
        type: "gradient"
      },
      colors: ['#2980b9', '#2C3A47', '#DAF7A6', '#C70039', '#900C3F','#8e44ad','#1289A7','#B53471'], 
      labels: newLabels,
    
      legend: {
        position: 'right',
        fontSize: '12px'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    
    };
    
    const chart = new ApexCharts(document.querySelector("#chart"), options);
    chart.render();
  }
  
  fetchTopJobTitlesData() {
    this.getDataService.getTopJobTitlesData().subscribe(
      (data: any[]) => {
        this.topJobTitlesData = data;
        console.log(data,'job title data');
        
        this.renderPieChart2(); // Call function to render pie chart after data is fetched
      },
      (error) => {
        console.error('Error fetching top countries data:', error);
      }
    );
  }

  renderPieChart2() {
    const labels = this.topJobTitlesData.map(jobTitle => jobTitle.job_title);
    const series = this.topJobTitlesData.map(jobTitle => jobTitle.count);

    const newSeries = series;
    const newLabels = labels; // Assuming labels remain the same
    const options = {
      series: newSeries,
      chart: {
        type: 'pie',
        width: 400,
        height: 400,
        fontFamily: 'Arial, sans-serif', 
        background: '#f5f5f5'
      },
      colors: ['#d1ccc0', '#8e44ad', '#DAF7A6', '#C70039', '#EAB543','#16a085','#1289A7','#95a5a6','#B33771','#fab1a0'],
      fill: {
        type: "gradient"
      },
      labels: newLabels,
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    };
  
 
    const chart = new ApexCharts(document.querySelector("#chart2"), options);
    
    chart.render();
  }






  ////3d chart for job titles
  loadGoogleCharts() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.fetchData.bind(this)); // Fetch data after charts are loaded
  }

  fetchData() {
    this.getDataService.getTopJobTitlesData().subscribe(
      (data: any[]) => {
        this.topJobTitlesData = data;
        console.log(data, 'job title data');
        this.drawChart();
      },
      (error) => {
        console.error('Error fetching top job titles data:', error);
      }
    );
  }

  drawChart() {
    if (!this.topJobTitlesData || this.topJobTitlesData.length === 0) {
      console.warn('No data available to draw chart.');
      return;
    }

    const dataArray = [['Job Title', 'Count']]; // Initialize with column headers

    // Populate dataArray with dynamic data
    this.topJobTitlesData.forEach(jobTitleData => {
      dataArray.push([jobTitleData.job_title, jobTitleData.count]);
    });

    const data = google.visualization.arrayToDataTable(dataArray);

    const options = {
      title: 'Job Titles Data',
      is3D: true,
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_3d'));
    chart.draw(data, options);
  }












  /////3d country chart
  
  loadGoogleCharts2() {
    google.charts.load('current', { packages: ['corechart'] });
    google.charts.setOnLoadCallback(this.fetchData.bind(this)); // Fetch data after charts are loaded
  }

  fetchData2() {
    this.getDataService.getTopCountriesData().subscribe(
      (data: any[]) => {
        this.topCountriesData = data;
        console.log(data, 'country data');
        this.drawChart2();
      },
      (error) => {
        console.error('Error fetching top countries data:', error);
      }
    );
  }

  drawChart2() {
    if (!this.topCountriesData || this.topCountriesData.length === 0) {
      console.warn('No data available to draw chart.');
      return;
    }

    const dataArray = [['Country', 'Count']]; // Initialize with column headers

    // Populate dataArray with dynamic data
    this.topCountriesData.forEach(countryData => {
      dataArray.push([countryData.country, countryData.count]);
    });

    const data = google.visualization.arrayToDataTable(dataArray);

    const options = {
      title: 'Available Country Data',
      is3D: true,
    };

    const chart = new google.visualization.PieChart(document.getElementById('piechart_2d'));
    chart.draw(data, options);
  }
}