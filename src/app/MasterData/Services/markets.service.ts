import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class MarketsService {
    apiURL = 'http://localhost:56054/api/v1/Markets';
    constructor(private http: HttpClient) { }

    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',

        })
    }

    getMarkets(): Observable<any> {
        
        return this.http.get<any>(this.apiURL + '/GetMarkets')
            .pipe(
            retry(1),
            catchError(this.handleError)
            )
    }
    getMarketRegions(): Observable<any> {
        return this.http.get<any>(this.apiURL + '/GetMarketRegions')
            .pipe(
            retry(1),
            catchError(this.handleError)
            )
    }
    public saveMarketData(obj) {
        return this.http.post<any>(this.apiURL + "/AddMarket", obj);
    }
    public updateMarketData(obj) {
        return this.http.put<any>(this.apiURL + "/UpdateMarket", obj);
    }
    public deleteMarketData(obj) {
        return this.http.post<any>(this.apiURL + "/DeleteMarket", obj);
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
