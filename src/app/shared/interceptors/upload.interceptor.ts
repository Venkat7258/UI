import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of, concat } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

@Injectable()
export class UploadInterceptor implements HttpInterceptor {
  constructor(public _appService: AppService) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this._appService.enableLoader(true); 
    if (req.url === 'saveUrl') {
     
      const events: Observable<HttpEvent<any>>[] = [0, 30, 60, 100].map((x) => of(<HttpProgressEvent>{
        type: HttpEventType.UploadProgress,
        loaded: x,
        total: 100
      }).pipe(delay(1000)));
      const success = of(new HttpResponse({ status: 200 })).pipe(delay(1000));
      events.push(success);
      this._appService.enableLoader(false);
      return concat(...events);
    }
    if (req.url === 'removeUrl') {
      this._appService.enableLoader(false)
      return of(new HttpResponse({ status: 200 }));
    }
    return next.handle(req)
      .pipe(finalize(() => this._appService.enableLoader(false)));
  }
}
