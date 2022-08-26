import { HttpParams } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { ModalDismissReasons, NgbActiveModal, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PaginationDefalts, PrivilegCodes, SearchFilter } from '../../../shared/constants/global.constants';
import { SortDescriptor } from '@progress/kendo-data-query';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { FormControl, FormGroup } from '@angular/forms';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';

@Component({
  selector: 'app-formulation-review-comment',
  templateUrl: './formulation-review-comment.component.html',
  styleUrls: ['./formulation-review-comment.component.css']
})
export class FormulationReviewCommentComponent implements OnInit {
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  @Input() public FormulationDetails: any;
  formulationReviewCommentsList: GridDataResult;
  formulationReferenceNo: string;
  versionNo: string;
  searchFilter: SearchFilter = new SearchFilter();
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  AccessToERC = true;
  public sort: SortDescriptor[] = [{ field: 'RawMaterialName', dir: 'asc' }];
  type = 'numeric';
  position = 'bottom';
  closeResult: string;
  formulationReviewCommentForm: any;
  allFormulationRawMaterialsInfo: any[] = [];
  rawMaterialList: any[] = [];
  manufacturerList: any[] = [];
  supplierList: any[] = [];
  tradeNameList: any[] = [];
  subComponentList: any[] = [];
  marketList: any[] = [];
  assignUserList: any[] = [];
  public defaultItem: { Name: string; Id: number } = { Name: "All", Id: null, };
  formulationRawMaterialsModel: any = {};
  @ViewChild('ReplyCommentModel', { static: true }) ReplyCommentModel: ElementRef;
  @ViewChild('EditCommentModel', { static: true }) EditCommentModel: ElementRef;
  constructor(public rmmapi: RMMApiService,
    private _modalService: NgbModal,
    private _notifyService: NotificationService,
    public activeModal: NgbActiveModal) {
    this.formulationReviewCommentForm = new FormGroup({
      RawMaterialId: new FormControl(""),
      ManufacturerId: new FormControl(""),
      SupplierId: new FormControl(""),
      TradeName: new FormControl(""),
      SubComponentId: new FormControl(""),
      MarketId: new FormControl(""),
      Comment: new FormControl(""),
      CommentAssignedTo: new FormControl(""),
      CommentDueDate: new FormControl("")
    });
  }

  ngOnInit(): void {
    this.setDefaults();
    setTimeout(() => {
      this.formulationReferenceNo = this.FormulationDetails.FormulationReferenceNo;
      this.versionNo = this.FormulationDetails.VersionNo;
      if (this.FormulationDetails.isFromDashboard) {
        this.EditReviewComment(this.FormulationDetails.actionType == 1 ? this.ReplyCommentModel : this.EditCommentModel, this.FormulationDetails, this.FormulationDetails.actionType);
      } else {
        this.GetFormulationReviewComments();
      }
      this.AccessToERC = this.rmmapi.getRolePrivilege(PrivilegCodes.ERC).toString() === 'true' ? true : false;
    }, 500);

  }

  ngAfterViewInit() {
    this.ReplyCommentModel;
    //this.EditReviewComment(actionType ? this.ReplyCommentModel : this.EditCommentModel, dataItem, actionType);
  }

  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "RawMaterialName asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }

  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetFormulationReviewComments();
  }

  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "RawMaterialName asc";
    this.sort = sort;
    this.GetFormulationReviewComments();
  }

  GetFormulationMarkets() {
    let params = new HttpParams().set("formulationDetailId", this.FormulationDetails.Id.toString());
    this.rmmapi.getData("FormulationRawMaterialSubComponentMarketRegulations/GetFormulationMarkets", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.marketList = res.Data;
      }
    });
  }

  GetFormulationReviewComments() {
    let params = new HttpParams().set("formulationDetailId", this.FormulationDetails.Id.toString()).set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("FormulationReviewComments/GetFormulationReviewComment", params).toPromise().then((res: any) => {
      if (res && res.Status && res.Data) {
        this.formulationReviewCommentsList = {
          data: res.Data.FormulationReviewComments,
          total: res.Data.TotalRecords
        };
      }
    });
  }

  AddComment(model: any) {
    this.activeModal.close();
    this.GetFormulationMarkets();
    this.GetFormulationRawMaterials();
    this.modalReference = this._modalService.open(model, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  GetDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  GetFormulationRawMaterials() {
    let params = new HttpParams().set("formulationDetailId", this.FormulationDetails.Id.toString());
    this.rmmapi.getData("FormulationReviewComments/GetRawMaterialDetails", params).toPromise().then((resp: any) => {
      if (resp && resp.Status && resp.Data) {
        this.rawMaterialList = resp.Data;
      }
    })
  }

  rawMaterialName: string;
  formulationRawMaterialId: number;
  OnRawMaterialChange(event: any) {
    this.manufacturerList = this.subComponentList = this.supplierList = this.tradeNameList = this.marketList = [];
    //this.formulationReviewCommentForm.reset();    
    this.rawMaterialName = event.Name;
    this.formulationRawMaterialId = event.FormulationRawMaterialId;
    if (event && event.ManufacturerList && event.ManufacturerList.length > 0) {
      this.manufacturerList = event.ManufacturerList;
    }
    if (event && event.SupplierList && event.SupplierList.length > 0) {
      this.supplierList = event.SupplierList;
    }
    if (event && event.TradeList && event.TradeList.length > 0) {
      this.tradeNameList = event.TradeList;
    }
    if (event && event.SubComponentList && event.SubComponentList.length > 0) {
      this.subComponentList = event.SubComponentList;
    }
  }

  SaveReviewComment() {
    if (this.formulationReviewCommentForm.valid) {
      let model: any = {};
      if (this.formulationRawMaterialsModel.Id > 0) {
        model.Id = this.formulationRawMaterialsModel.Id;
        model.isReplied = this.isReplied;
        model.Comment = this.formulationRawMaterialsModel.Comment;
        model.CommentsReplied = this.formulationRawMaterialsModel.CommentsReplied;
        model.CommentRepliedBy = "";
        model.CommentRepliedDate = new Date();
        model.CommentUpdatedBy = "";
        model.CommentUpdatedDate = new Date();
        model.CommentClosedBy = "";
        model.CommentClosedDate = new Date();
        model.IsClosed = this.formulationRawMaterialsModel.IsClosed;
        this.rmmapi.postData("FormulationReviewComments/UpdateFormulationReviewComment", model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "Comment updated successfully");
            this.GetFormulationReviewComments();
            this.ReviewCommentsGrid();
          } else {
            this._notifyService.showError("", resp.Message);
          }
        });
      } else {
        model.Comment = this.formulationRawMaterialsModel.Comment;
        model.CommentAssignedTo = this.formulationRawMaterialsModel.CommentAssignedTo != null ? this.formulationRawMaterialsModel.CommentAssignedTo.Name : "";
        model.CommentDueDate = this.formulationRawMaterialsModel.CommentDueDate! = undefined ? this.formulationRawMaterialsModel.CommentDueDate : null;
        model.FormulationDetailId = this.FormulationDetails.Id;
        model.FormulationRawMaterialId = this.formulationRawMaterialId != null ? this.formulationRawMaterialId : 0;
        model.RawMaterialId = this.formulationRawMaterialsModel.RawMaterialId != null ? this.formulationRawMaterialsModel.RawMaterialId.Id : 0;
        model.SupplierId = this.formulationRawMaterialsModel.SupplierId != null ? this.formulationRawMaterialsModel.SupplierId : 0;
        model.ManufacturerId = this.formulationRawMaterialsModel.ManufacturerId != null ? this.formulationRawMaterialsModel.ManufacturerId.Id : 0;
        model.TradeName = this.formulationRawMaterialsModel.TradeName != null ? this.formulationRawMaterialsModel.TradeName.Id : '';
        model.FormulationRawMaterialSubComponentId = this.formulationRawMaterialsModel.SubComponentId != null ? this.formulationRawMaterialsModel.SubComponentId.Id : 0;
        model.MarketId = this.formulationRawMaterialsModel.MarketId != null ? this.formulationRawMaterialsModel.MarketId.Id : 0;
        model.Tbl_FormulationReviewComments
        model.CommentCreatedBy = "";
        model.CommentCreatedDate = new Date();
        this.rmmapi.postData("FormulationReviewComments/AddFormulationReviewComment", model).toPromise().then((resp: any) => {
          if (resp && resp.Status) {
            this._notifyService.showSuccess("", "New comment added successfully");
            this.GetFormulationReviewComments();
            this.ReviewCommentsGrid();
          } else {
            //this._notifyService.showError("", resp.Message);
            this._notifyService.showError("", "Sorry, new comment could not be added");
          
          }
        });
      }
    } else {
      this.formulationReviewCommentForm.markAllAsTouched();
    }
  }

  ReviewCommentsGrid() {
    this.modalReference.close();
    this.modalReference = this._modalService.open(FormulationReviewCommentComponent, { size: 'xl' });
    this.modalReference.componentInstance.FormulationDetails = this.FormulationDetails;
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  isReplied: boolean;
  IsClosed: boolean;
  EditReviewComment(popUpName: any, dataItem: any, isReplied: boolean) {
    this.AccessToERC = this.rmmapi.getRolePrivilege(PrivilegCodes.ERC).toString() === 'true' ? true : false;
    this.rawMaterialName = dataItem.RawMaterialName;
    this.isReplied = isReplied;
    this.formulationRawMaterialsModel = dataItem;
    this.formulationRawMaterialsModel.IsClosed = this.IsClosed = dataItem.StatusName == "Closed" ? true : false;
    this.activeModal.close();
    this.modalReference = this._modalService.open(popUpName, { size: 'xl' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.GetDismissReason(reason)}`;
    });
  }

  ReviewCommentFromDashboard(dataItem: any, actionType: boolean) {
    setTimeout(() => {
      this.EditReviewComment(actionType ? this.ReplyCommentModel : this.EditCommentModel, dataItem, actionType);
      this.ngAfterViewInit();
    }, 1000);
  }


  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
}
