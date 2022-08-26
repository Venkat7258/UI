import { HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, SimpleChange,ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { PaginationDefalts, SearchFilter } from 'src/app/shared/constants/global.constants';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
@Component({
  selector: 'app-formulation-document-tracking',
  templateUrl: './formulation-document-tracking.component.html',
  styleUrls: ['./formulation-document-tracking.component.css']
})
export class FormulationDocumentTrackingComponent implements OnInit {

  @Input("formulationDetail") formulationDetail : any;
  searchFilter : SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [ { field: 'RawMaterialName', dir: 'asc'}];
  documentTrackingList : GridDataResult;
  constructor(public _appService: AppService,
    public _rmmapi: RMMApiService,
    private _notifyService: NotificationService) { }

  ngOnInit(): void {
  }

  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }

  ngOnChanges(changes : SimpleChange) {
    this.setDefaults();
    if(this.formulationDetail) {
      this.formulationDetail = changes['formulationDetail'].currentValue;
      this.GetDocumentTracking();
    }
  }

  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber =   event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetDocumentTracking();
 }
 

  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
    this.sort = sort;  
    this.GetDocumentTracking();
  }

  GetDocumentTracking() {
    let params = new HttpParams().set("formulationDetailId", this.formulationDetail.Id.toString()).set("pageSize", this.searchFilter.pageSize.toString())
      .set("pageNumber", this.searchFilter.pageNumber.toString()).set("sort", this.searchFilter.sort);
    this._rmmapi.getData("FormulationINCIBreakdownList/GetFormulationDocumentTracking", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        // let data = res.Data;
        // this.documentTrackingList = data.DocumentCompliance;   
        this.documentTrackingList = {
          data: res.Data.DocumentCompliance,
          total: res.Data.DocumentCompliance && res.Data.DocumentCompliance.length > 0 ? res.Data.DocumentCompliance[0].TotalRecords : 0
      };     
      }
    });
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN' || element.nodeName === 'KENDO-GRID')
        && element.offsetWidth < element.scrollWidth) {
        this.tooltipDir.toggle(element);
    } else {
        this.tooltipDir.hide();
    }
} 
}
