import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {catchError, map, skipWhile, tap} from 'rxjs/operators'


import { Observable } from 'rxjs/internal/Observable';
import { AuthService } from 'src/app/auth.service';
import { BehaviorSubject, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GetDataService   {
  private currentPageSubject: BehaviorSubject<number>;
  public currentPage$: Observable<number>;

  // require_once "/home/u858543158/domains/vectordb.app/public_html/api/v1/db/index.php";

  private search_url_New = 'http://192.168.0.5:9090/search';

  private search_url_total = 'http://192.168.0.5:8080/search';

  private base_url = 'https://api.vectordb.app/v1/';
  private api_Url = 'https://app.datagateway.in/API/'; 
  // savedSearchFilters: any[];
  // savedSearchFilters: any[];

  getlastBounce(email: string): Observable<any> {
    const api_key = this.authService.getapi_key();
    const countUrl = `${this.base_url}auth/credit/?api=${api_key}&email_address=${email}`;
    return this.http.get<any>(countUrl);
  }

  headers = new HttpHeaders().set('Content-Type','application/json').set('Accept','application/json')
  httpOptions={
    headers:this.headers
    }
  constructor(private http: HttpClient,private authService:AuthService) {
   this.currentPageSubject = new BehaviorSubject<number>(1);
  this.currentPage$ = this.currentPageSubject.asObservable();
  }
 
 
  getCurrentPage(): number {
    return this.currentPageSubject.value;
  }

  setCurrentPage(page: number): void {
    this.currentPageSubject.next(page);
  }

  searchRecords(filters: any, page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();
  
    if (Object.keys(filters).length > 0) {
      // Remove 'api' key from filters
      const { api, ...filteredParams } = filters;
      
      const params = new HttpParams({
        fromObject: { ...filteredParams, page: page.toString() }
      });
  
      
      const searchUrl = `${this.base_url}search/people/?api=${api_key}`;
  
      return this.http.get<any>(searchUrl, { params });
    } else {
      return of(null);
    }
  }
  
  searchRecords1(filters: any, page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();
  
    if (Object.keys(filters).length > 0) {
      // Remove 'api' key from filters
      const { api, ...filteredParams } = filters;
  
      const params = new HttpParams({
        fromObject: { ...filteredParams, page: page.toString() }
      });
  
      // Append '/?api=' to the base URL
      const searchUrl = `${this.search_url_New}?tableName=${api_key}`;
  
      return this.http.get<any>(searchUrl, { params });
    } else {
      return of(null);
    }
  }
  
googleSignin(googleWrapper: any) {  
  googleWrapper.click();
}

saveDataToUserAccount(email: string, selectedRows: any[]): Observable<any> {
  const api_key = this.authService.getapi_key();
  const selectedIds = selectedRows.map(row => row.Prospect_Link);
  const selectedIdsString = selectedIds.join('&selectedRowIds[]=');

  // const url = `${this.saveDataApiUrl}?dynamic_table=${email}&selectedRowIds[]=${selectedIdsString}`;
  const countUrl = `${this.base_url}search/people/savedata/?api=${api_key}&selectedRowIds[]=${selectedIdsString}`;

  return this.http.post(countUrl, null);
}


saveDataToUserAccount1(selectedRows: any[]): Observable<any> {
  const api_key = this.authService.getapi_key();
  const selectedIds = selectedRows.map(row => row.prospect_Link);
  

  const url = `${this.base_url}search/people/savedata/`;

  const params = new HttpParams()
    .set('data', 'save')
    .set('selectedRowIds', JSON.stringify(selectedIds))
    .set('api', api_key || ''); // Handle case where api_key might be null
    console.log('Selected Rows in Service:', selectedIds);
  return this.http.post(url, null, { params });
}



  
exportToCSV(filters: any, selectedRows: any[]): Observable<any> {
  const api_key = this.authService.getapi_key();
  const selectedIds = selectedRows.map(row => row.prospect_Link);
  
  // console.log('Selected Rows from service:', selectedRows);
  // console.log('Selected IDs from service:', selectedIds);

  const params = {
    ...filters,
    export: 'csv',
    selectedIds: JSON.stringify(selectedIds),
    api: api_key
  };

  const exportCsvUrl = `${this.base_url}search/people/export/`;

  return this.http.get(exportCsvUrl, {
    params: params,
    responseType: 'text'
  });
}





  getSavedData(email: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.base_url}search/people?user_email=${email}`);
  }
  
 
  getSavedDataForUser(page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();

    if (!api_key) {
      console.error('User email not found.');
      return of(null);
    }

    const params = new HttpParams({
      fromObject: { api: api_key, page: page.toString() }
    });

    return this.http.get<any>(this.base_url + 'search/people/saved/?', { params });
  }


  registerUser(user: any): Observable<any> {
    return this.http.post(this.api_Url + 'signup_process.php', JSON.stringify(user), {
      headers: new HttpHeaders().set('Content-Type', 'application/json'),
      responseType: 'text'
    })
    .pipe(
      catchError((error) => {
        
        if (error.status === 404) {
          console.error('User not found.', error);
        } else if (error.status === 409) {
          console.error('Conflict: Email already exists. Please use a different email address.', error);
        } else {
          console.error('Error registering user:', error);
        }
        return throwError(error); 
      })
    );
  }
  
  loginUser(user: any): Observable<any> {
    return this.http.post(this.base_url + 'auth/login/', user, { responseType: 'json' })
      .pipe(
        tap((response: any) => {
          this.authService.setToken(response.token);
          localStorage.setItem('user_id', response.id);
          localStorage.setItem('email', response.email);
          // localStorage.setItem('api_key', response.api_key);
        })
      );
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(this.base_url + 'auth/resetPassword/', data, { responseType: 'json' });
  }

  getAllDetailsForUser(prospectLink: string): Observable<any> {
    return this.http.get(`${this.base_url + 'search/people/getUserDetails/'}?Prospect_Link=${prospectLink}`);
  }

  

  getData(): Observable<string[]> {
    return this.http.get('https://api.vectordb.app/v1/search/people/count/?')
      .pipe(
        map((response: any) => {
          return Object.keys(response).map(key => response[key]['name']);
        })
      );
  }

  private apiUrlnode = 'http://localhost:3000'; // Update the API URL

  signup(email: string) {
    return this.http.post<any>(`${this.apiUrlnode}/email/signup`, { email }); // Corrected URL
  }

  confirmEmail(token: string) {
    return this.http.get<any>(`${this.apiUrlnode}/email/get?token=${token}`); // Fixed interpolation
  }

  getCounts(): Observable<any> {
    const api_key = this.authService.getapi_key();
    const countUrl = `${this.base_url}search/people/count/?api=${api_key}`;
    return this.http.get<any>(countUrl);
  }

  getTimestampData(page: number = 1): Observable<any> {
    const api_key = this.authService.getapi_key();

    if (!api_key) {
      console.error('User email not found.');
      return of(null);
    }

    const params = new HttpParams({
      fromObject: { api: api_key, page: page.toString() }
    });

    const url = `${this.base_url}enrichment/userGraph/`; 

    return this.http.get<any>(url, { params });
  }

  getTopCountriesData(): Observable<any[]> {
    const url = `${this.base_url}enrichment/country/`;  
    return this.http.get<any[]>(url);
  }

  getTopJobTitlesData(): Observable<any[]> {
    const url = `${this.base_url}enrichment/jobT/`;  
    return this.http.get<any[]>(url);
  }

  // upadated on 14-05-24
 

  // api.service.ts
// api.service.ts
saveSearch(filter_name: string, filters: any): Observable<any> {
  const api_key = this.authService.getapi_key();
  const url = `https://api.vectordb.app/v1/search/people/save-filters/?api=${api_key}&filter_name=${filter_name}`;

  // Do not JSON.stringify the filters object here
  const body = {
    filters: filters // Ensure filters are sent as an object
  };

  return this.http.post<any>(url, body, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  });
}

// updated on 26-Jun-24
getSavedFilters(): Observable<any[]> {
  const api_key = this.authService.getapi_key();
  const Url = `https://api.vectordb.app/v1/search/people/getSaveFilter/?api=${api_key}`;

  return this.http.get<any[]>(Url);
}




  }



