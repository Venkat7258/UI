import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(private http: HttpClient, public rmmapi: RMMApiService) { }

  DownloadFile(filename: string): void {
    const baseUrl = this.rmmapi.getUrl("SupplierRawMaterialDocumentDetails/DownloadDocuments");

    let headers = this.rmmapi.setHeaders();
    let params = new HttpParams().set("fileName", filename);
    this.http.get(baseUrl, { headers, params, responseType: 'blob' as 'json' }).subscribe(
      (response: any) => {
        let dataType = response.type;
        let binaryData = [];
        binaryData.push(response);
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: dataType }));
        if (filename)
          downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }
    );
  }
}
