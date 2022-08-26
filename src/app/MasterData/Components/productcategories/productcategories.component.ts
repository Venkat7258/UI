import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AppService } from 'src/app/app.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';
import { NotificationService } from './../../../shared/services/notification.service';
import { ProductCategory } from '../../Models/product-category';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';
import { TooltipDirective } from '@progress/kendo-angular-tooltip';
import { EnvService } from 'src/app/shared/services/env.service';
@Component({
  selector: 'app-productcategories',
  templateUrl: './productcategories.component.html',
  styleUrls: ['./productcategories.component.css']
})
export class ProductcategoriesComponent implements OnInit {
  public productcategoriesInfo: any[] = [];
  public productcategoriesList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  productcategoriesform: any;
  ProductCategoryform: any;
  Model: any = new ProductCategory();
  ProductCategory : string;
  actionType: boolean = true;
  submitted = false;
  isDuplicateProduct: boolean = false;
  productExists: string;

  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private notifyService: NotificationService,
    private modalService: NgbModal,
    public env : EnvService) {
    this.ProductCategoryform = new FormGroup({
      ProductCategoryName: new FormControl("", [Validators.required]),//, Validators.pattern(/[^A-Za-z0-9]+/)
    });
  }
  ngOnInit(): void {
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.GetProductCategories();
  }
  setDefaults() {
    this.searchFilter.pageSize = PaginationDefalts.pageSize;
    this.searchFilter.pageNumber = PaginationDefalts.pageNumber;
    this.searchFilter.sort = "Name asc";
    this.searchFilter.buttonCount = PaginationDefalts.buttonCount;
    this.searchFilter.pageSkip = PaginationDefalts.pageSkip;
  }
  pageChange(event: PageChangeEvent): void {
    this.searchFilter.pageSkip = event.skip;
    this.searchFilter.pageSize = event.take;
    this.searchFilter.pageNumber = event.skip > 0 ? (event.skip / event.take) + 1 : 1;
    this.GetProductCategories();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.GetProductCategories();
  }
  GetProductCategories() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("ProductCategories/GetAllProductCategories", params).toPromise().then((resp: any) => {
      this.productcategoriesInfo = resp.Data;
      this.productcategoriesList = {
        data: resp.Data.ProductsCategoryDetailList,
        total: resp.Data.ProductsCategoryDetailList && resp.Data.ProductsCategoryDetailList.length > 0 ? resp.Data.ProductsCategoryDetailList[0].TotalRecords : 0
      };
    })
  }
  AddProductCategoriesModal(content) {
    this.actionType = true;
    this.ProductCategoryform.reset();
    this.isDuplicateProduct = false;
    this.submitted=false;
    this.Model = new ProductCategory();
    this.modalReference = this.modalService.open(content, { size: 'lg' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    this.productcategoriesform.reset();
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }


  AddproductCategoriesInfo() {

    this.submitted = true;
    this.Model.Name = this.Model.Name != undefined ? this.Model.Name.trim() : '' ;
    if (this.ProductCategoryform.valid) {

    this.rmmapi.getData("ProductCategories/CheckDuplicateProductCategory?productCategories=" + this.Model.Name.trim()+ "&id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
      this.isDuplicateProduct =res.Data;
     // if (res && res.Status && res.Data > 0) {
      //  this.isDuplicateProduct = true;
        if(!this.isDuplicateProduct) {
         
          if (this.Model.Id > 0 ) {
              this.Model.UpdatedBy = "";
              this.Model.UpdatedDate = new Date();
              this.rmmapi.postData("ProductCategories/UpdateProductCategory", this.Model).toPromise().then((resp: any) => {
                if (resp && resp.Status) {
                  this.notifyService.showSuccess("", "Product Category updated successfully");
                  this.GetProductCategories();
                  this.modalReference.close();
                } else {
                  this.notifyService.showError("", "Sorry, Product Category could not be updated");
                }
              });
          }
          else {
            this.Model.CreatedBy = "";
            this.Model.CreatedDate = new Date();
            this.Model.Name=this.Model.Name;
            this.rmmapi.postData("ProductCategories/AddProductCategory", this.Model).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                this.notifyService.showSuccess("", "Product Category added successfully");
                this.GetProductCategories();
                this.modalReference.close();
              } else {
                this.notifyService.showError("", "Sorry, Product could not be added");
              }
            });
          }

    
        }

   //   }

    });
  }
}

  EditProductcategoriesInfo(value1: any, value2: any) {
    this.isDuplicateProduct = false;
    if (this.rmmapi.getRolePrivilege('VPC') && this.rmmapi.getRolePrivilege('MPC')) {
      this.actionType = false;
      this.resetControls();
      this.ProductCategoryform.reset();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
    else {
      this.ProductCategoryform.controls["ProductCategoryName"].disable();
      this.actionType = false;
      this.resetControls();
      this.ProductCategoryform.reset();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
  }
  DeleteProductcategoriesInfo(Data) {
    this.Model.UpdatedBy = "";
    this.rmmapi.postData("ProductCategories/DeleteProductCategory", { Id: this.Model.Id, UpdatedBy: "" }).toPromise().then((resp: any) => {
      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.GetProductCategories();
          this.notifyService.showSuccess("", "Product Category inactivated successfully");
        } else {
          this.notifyService.showWarning("", "Sorry, this Product Category could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("","Error: unable to inactivate productcategory");
      }
      this.modalReference.close();
    })
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
  
 
  checkDuplicate() {

    if(this.Model.Name.trim().length==0)
    {
      this.Model.Name = ''; 
      this.productcategoriesform.markAsUnTouched();
      return;

    }
    
    this.rmmapi.getData("ProductCategories/CheckDuplicateProductCategory?productCategories=" + this.Model.Name.trim()+ "&id=" + (this.Model.Id === undefined ? 0 : this.Model.Id)).toPromise().then((res: any) => {
      if (res && res.Status && res.Data > 0) {
        this.isDuplicateProduct = true;
        this.productExists = this.env.ValidationMessages.Thisvaluealreadyexists;
        this.ProductCategoryform.controls["ProductCategoryName"].setErrors({ 'incorrect': true });
      } else {
        this.isDuplicateProduct = false;
        this.productExists = "";
        this.ProductCategoryform.controls["ProductCategoryName"].setErrors(null);
      }
    });
   
    

  }
  resetControls() {
    this.productExists = "";
    this.isDuplicateProduct = false;
  }
  @ViewChild(TooltipDirective) public tooltipDir: TooltipDirective;
  public showTooltip(e: MouseEvent): void {
    const element = e.target as HTMLElement;
    if ((element.nodeName === 'TD' || element.nodeName === 'TH' || element.nodeName === 'SPAN')
      && element.offsetWidth < element.scrollWidth) {
      this.tooltipDir.toggle(element);
    } else {
      this.tooltipDir.hide();
    }
  }
  public noWhitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').length === 0;
    const isValid = !isWhitespace;

    console.log('oWhitespaceValidator: ' + isValid);
    return isValid ? null : { 'whitespace': true };
  }
}
