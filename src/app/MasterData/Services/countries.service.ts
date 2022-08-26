import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

 
  apiURL = 'http://localhost:56054/api/v1/Countries';
  constructor(private http: HttpClient) { }

  httpOptions = {
      headers: new HttpHeaders({
          'Content-Type': 'application/json',

      })
  }

  getAllCountries(): Observable<any> {
      
      return this.http.get<any>(this.apiURL + '/GetCountries')
          .pipe(
          retry(1),
          catchError(this.handleError)
          )
  }
  public updateCountryData(obj) {
    return this.http.put<any>(this.apiURL + "/UpdateCountry", obj);
}
public deleteCountryData(obj) {
    return this.http.post<any>(this.apiURL + "/DeleteCountry", obj);
}
public saveCountryData(obj) {
  return this.http.post<any>(this.apiURL + "/AddCountry", obj);
}
  handleError(error) {
    let errorMessage = '';
     if (error.error instanceof ErrorEvent) {
         // Get client-side error
         errorMessage = error.error.message;
     } else {
         // Get server-side error
         errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
     }
     window.alert(errorMessage);
     return throwError(errorMessage);
 }
}
