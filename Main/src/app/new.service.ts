import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NewService {

  private validationStatus: { [key: string]: { isValidEmail: string, clicked: boolean } } = {};


  // Method to retrieve the stored validation status for an email
  getStoredValidationStatus(email: string): { isValidEmail: string, clicked: boolean } | null {
    return this.validationStatus[email] || null;
  }

  // Method to store the validation status for an email
  storeValidationStatus(email: string, data: { isValidEmail: string, clicked: boolean }): void {
    this.validationStatus[email] = data;
  }



  url='http://localhost:3000/data'


  constructor(private http:HttpClient) { }
  headers = new HttpHeaders()
  httpOptions={
  headers:this.headers
  }

  postdata(body:any){
   return this.http.post(`${this.url}`,body)
  }
  getdata(){
    return this.http.get(this.url)
  }




  @Output() changeTimeRange: EventEmitter<boolean> = new EventEmitter();
  @Output() changeSeriesData: EventEmitter<boolean> = new EventEmitter();


  eventChangeTimeRange() {
    this.changeTimeRange.emit();
  }

  eventChangeSeriesData() {
    this.changeSeriesData.emit();
  }






}
