import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { AppService } from '../../../app.service';
import { FormulationReviewCommentComponent } from '../../../formulation/Components/formulation-review-comment/formulation-review-comment.component';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  @Input() public FormulationDetails: any;
  formulationReviewComments: GridDataResult;
  formulationDetails: GridDataResult;
  rawMaterialDocument: GridDataResult;
  countrywiseRawMaterialSuppliers: any;
   
  isRawMaterialLoading: boolean = false;
  isFormulationLoading: boolean = false;
  isCommentLoading: boolean = false;

  constructor(public _appService: AppService,
    private _rmmapi: RMMApiService,
    private _route: Router,
    public rmmapi: RMMApiService,
    public env: EnvService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService) { }

  ngOnInit(): void {
    const isTrue = this._rmmapi.getStorage("IsThisAfterLogin_LoadingDashboard");
 
    if(isTrue === "1") {
      this._rmmapi.removeStorage("IsThisAfterLogin_LoadingDashboard");
      location.reload();
    } 

    this._appService.setHeaderUserName(this._rmmapi.getUserName());
    this._appService.setHeaderShow(true);
    this._appService.setHeaderTitle("Dashboard");

    this.GetFormulationReviewComments();
    this.GetFormulationDetails();
    this.GetRawMaterialDocument();
    this.GetCountryWiseRawMaterialSuppliers();

  }

  GetFormulationReviewComments() {
    this.isCommentLoading = true;
    let params = new HttpParams().set("PageSize", '0').set("PageNumber", '0').set("userName", '');
    this._rmmapi.getData("Dashboard/GetDashboardFormulationReviewComments", params).toPromise().then((res: any) => {
      this.isCommentLoading = false;
      if (res && res.Status && res.Data) {
        this.formulationReviewComments = {
          data: res.Data.FormulationReviewComments,
          total: res.Data.FormulationReviewComments && res.Data.FormulationReviewComments.length > 0 ? res.Data.FormulationReviewComments[0].TotalRecords : 0
        };
      }
    }).catch((err: HttpErrorResponse) => {
      console.error(': RMM GetFormulationReviewComments : Exception Occured');
    });

  }

  GetFormulationDetails() {
    this.isFormulationLoading = true;
    let params = new HttpParams().set("PageSize", '0').set("PageNumber", '0').set("userName", '');
    this._rmmapi.getData("Dashboard/GetDashboardFormulation", params).toPromise().then((res: any) => {
      this.isFormulationLoading = false;

      if (res && res.Status && res.Data) {

        this.formulationDetails = {
          data: res.Data.FormulationDetailsList == null ? [] : res.Data.FormulationDetailsList,
          total: res.Data.FormulationDetailsList && res.Data.FormulationDetailsList.length > 0 ? res.Data.FormulationDetailsList[0].TotalRecords : 0
        };
      }
    }).catch((err: HttpErrorResponse) => {
      console.error(': RMM GetFormulationDetails: Exception Occured');
    });
  }

  GetRawMaterialDocument() {
    this.isRawMaterialLoading = true;
    let params = new HttpParams().set("PageSize", '1000').set("PageNumber", '0').set("userName", '');
    this._rmmapi.getData("Dashboard/GetDashboardRawMaterilDocuments", params).toPromise().then((res: any) => {
      this.isRawMaterialLoading = false;
      if (res && res.Status && res.Data) {
        this.rawMaterialDocument = {
          data: res.Data.DocumentCompliance,
          total: res.Data.DocumentCompliance && res.Data.DocumentCompliance.length > 0 ? res.Data.DocumentCompliance[0].TotalRecords : 0
        };
      }
    }).catch((err: HttpErrorResponse) => {
      this.isRawMaterialLoading = false;
      console.error(': RMM GetRawMaterialDocument : Exception Occured');
    });
  }

  GetCountryWiseRawMaterialSuppliers() {
    this._rmmapi.getData("Dashboard/CountrywiseRawMaterialSuppliers").toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.countrywiseRawMaterialSuppliers = res.Data;
        //   {
        //     data: res.Data.DocumentCompliance,
        //     total: res.Data.DocumentCompliance && res.Data.DocumentCompliance.length > 0 ? res.Data.DocumentCompliance[0].TotalRecords : 0
        // };
      }
    }).catch((err: HttpErrorResponse) => {
      console.error(': RMM GetCountryWiseRawMaterialSuppliers : Exception Occured');
    });
  }

  EditReviewComment(dataItem: any, actionType: string) {
    this._appService.formulationId = dataItem.FormulationDetailId;
    this._appService.reviewCommentId = dataItem.Id;
    this._appService.actionType = actionType;
    this._appService.commingFrom = "Review"
    this._route.navigate(['/Formulations']);
  }

  GotoFormulationDetails(dataItem: any, actionType: string) {
    this._appService.formulationId = dataItem.Id;
    this._appService.actionType = actionType;
    this._appService.commingFrom = "Formulation"
    this._route.navigate(['/Formulations']);
  }

  GotoRawMaterialDetails(dataItem: any, actionType: string) {
    this._appService.supplierRawMaterialDocumentId = dataItem.SupplierRawMaterialDocumentDetailId;
    this._appService.supplierRawMaterialId = dataItem.Id;
    this.rmmapi.setStorage(this.env.CurrentTabState.Id,  this._appService.supplierRawMaterialId);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, 'Document Details');
    this._route.navigate(['/RawMaterials']);
  }


  public showTooltip(e: MouseEvent, tooltip: TooltipDirective): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
        tooltip.toggle(element);
    } else {
      tooltip.hide();
    }
  }

  
}
