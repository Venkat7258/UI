import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class RegionsService {
    apiURL = 'http://localhost:56054/api/v1/Regions';
    constructor(private http: HttpClient) { }
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',

        })
    }
    getRegions(): Observable<any> {
        
        return this.http.get<any>(this.apiURL + '/GetRegions')
            .pipe(
            retry(1),
            catchError(this.handleError)
            )
    }
    public saveRegionData(obj) {
        return this.http.post<any>(this.apiURL + "/AddRegion", obj);
    }
    public updateRegionData(obj) {
        return this.http.put<any>(this.apiURL + "/UpdateRegion", obj);
    }
    public deleteRegionData(obj) {
        return this.http.post<any>(this.apiURL + "/DeleteRegion", obj);
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