import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, SimpleChange, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NotificationService } from '../../../shared/services/notification.service';
import { HttpParams } from '@angular/common/http';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { StatusName } from 'src/app/shared/constants/application.constants';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { BlockInvalidChar } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-formulation-transcript-summary',
  templateUrl: './formulation-transcript-summary.component.html',
  styleUrls: ['./formulation-transcript-summary.component.css']
})
export class FormulationTranscriptSummaryComponent implements OnInit {

  @Input("formulationDetail") formulationDetail: any;
  @Output() informToParent = new EventEmitter();

  formulationSummuryList: any;
  formulationMarketRegulationList: any;
  formulationMarketList: any;
  isSendforReview: boolean = false;
  isApproveTranscript: boolean = false;
  isGotoingredientList: boolean = false;
  isSaveTranscript: boolean = false;
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;

  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService) { }

  ngOnInit(): void {
    this._appService.setMasterDataShow(false);
  }

  ngOnChanges(changes: SimpleChange) {
    if (this.formulationDetail) {
      this.formulationDetail = changes["formulationDetail"].currentValue;
    }

    this.GetFormulationSummury();
  }

  GetFormulationSummury() {
    this.formulationSummuryList = [];
    let params = new HttpParams().set("formulationDetailId", this.formulationDetail.Id.toString());
    this.rmmapi.getData("FormulationTranscriptSummary/GetFormulationSummuryByFormulationDetailId", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationSummuryList = res.Data;
        this.formulationSummuryList.forEach(element => {
          // this.isSaveTranscript = this.isSendforReview = element.StatusName !== StatusName.FormulationDraft ? true : false;
          // this.isApproveTranscript = element.StatusName == StatusName.FormulationSummarySubmitted ? true : false;
          // // this.isSaveTranscript = this.isGotoingredientList = element.StatusName != StatusName.FormulationDraft ? true : false;

          this.isSendforReview = element.StatusName == StatusName.FormulationDraft ? true : false;
          this.isApproveTranscript = element.StatusName == StatusName.FormulationSummarySubmitted ? true : false;
          this.isSaveTranscript = this.isGotoingredientList = element.StatusName != StatusName.FormulationDraft ? true : false;
         
          if (element.FormulationRawMaterialSubComponents) {
            element.FormulationRawMaterialSubComponents.forEach(item => {
              item.Impurity = item.Impurity ? "Yes" : "No";
              if (item.FormulationTranscriptSummaryId > 0) {
                this.isUpdate = true;
              }
            });
          }
        });
      }
    });
  }

  isUpdate: boolean = false;
  SaveTranscript(ValidationMessagePopUp:any) {
    let list: any[] = [];
    var count = 0;
    this.formulationSummuryList.forEach(element => {
      element.FormulationRawMaterialSubComponents && element.FormulationRawMaterialSubComponents.forEach(item => {
        if (item.CASNumber === null || item.CASNumber === '') {
          count = +1;
        } 
        list.push(item);
      });
    });

    if (count == 0) {
      console.log(list);
      list.forEach(element => {
        element.FormulationDetailId = this.formulationDetail.Id;
        // element.CreatedDate = new Date();
        // element.UpdatedDate = new Date();
        if (!this.isUpdate) {
          element.CreatedDate = new Date();
          element.UpdatedDate = null;
        } else {
          element.UpdatedDate = new Date();
        }
      });
      this.rmmapi.postData("FormulationTranscriptSummary/AddFormulationTranscriptSummary", list).toPromise().then((resp: any) => {
        if (resp && resp.Status) {
          this._notifyService.showSuccess("", "Formulation Summary updated successfully");
          this.GetFormulationSummury();
        }
        else{
          this._notifyService.showError("","Sorry, Formulation Summary details could not be updated");
        }
      });
    } else {
      this._modalService.open(ValidationMessagePopUp, { size: 'sm' });
    }
  }

  ViewRegulationMarkets(value1: any, value2: any) {
    this.GetRegulationMarkets(value2);
    this.modalReference = this._modalService.open(value1, { size: 'xl' });
  }

  GetRegulationMarkets(mode: any) {
    this.formulationMarketRegulationList = [];
    let params = new HttpParams().set("formulationDetailId", this.formulationDetail.Id.toString()).set("formulationRawMaterialId", mode.FormulationRawMaterialId)
      .set("formulationRawMaterialSubComponentId", mode.FormulationRawMaterialSubComponentId);
    this.rmmapi.getData("FormulationTranscriptSummary/GetFormulationSummuryMargetRegulations", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationMarketList = res.Data;
        if (this.formulationMarketList.length > 0) {
          this.formulationMarketRegulationList = this.formulationMarketList[0].Regulations;
        }
      }
    });
  }

  MarketChange(item: any) {
    this.formulationMarketRegulationList = item.Regulations;
  }

  SendforReview(code: string) {
    let model: any = {};
    model.FormulationDetailId = this.formulationDetail.Id;
    model.StatusCode = code;
    model.UpdatedBy = this.rmmapi.getUserName();
    model.FormulationReferenceNo = this.formulationDetail.FormulationReferenceNo;
    model.VersionNo = this.formulationDetail.VersionNo;
    this.rmmapi.postData("FormulationTranscriptSummary/UpdateFormulationDetailStatus", model).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if(model.StatusCode=="FSS")
        {
        this._notifyService.showSuccess("", "Formulation Summary sent for review");
        }
        else
        {
          this._notifyService.showSuccess("", "Formulation Summary approved");
        }
        this.GetFormulationSummury();
        this.isGotoingredientList = true;
      }
      else{
        this._notifyService.showError("","Sorry, Formulation Summary could not be sent for review");
      }
    });
  }

  GotoingredientList() {
    this.informToParent.emit();
  }

  ValidateInputForSummaryTab(x: any) {
    if (x.Concentration  != undefined && x.Concentration  > 100) {
      x.Concentration  = 100;
    }
  }

  NumberTypeValidation(event:any,dataItem: any){
    BlockInvalidChar(event);
    // dataItem.Concentration = event.target.value;
  }

  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && (element.offsetWidth < element.scrollWidth) && element.innerText !='') {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}
