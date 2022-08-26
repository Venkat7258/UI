import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../../app.service';
import { RMMApiService } from '../../../shared/services/rmmapi.service';
import { ModalDismissReasons, NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Products } from '../../Models/product';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../../shared/services/notification.service';
import { EnvService } from 'src/app/shared/services/env.service';
import { PaginationDefalts, SearchFilter } from '../../../shared/constants/global.constants';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';
import { SortDescriptor } from '@progress/kendo-data-query';
import { HttpParams } from '@angular/common/http';

import { TooltipDirective } from '@progress/kendo-angular-tooltip';
@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  public productsinfo: any[] = [];
  public productList: GridDataResult;
  searchFilter: SearchFilter = new SearchFilter();
  public sort: SortDescriptor[] = [{ field: 'Name', dir: 'asc' }];
  public type = "numeric";
  public position = "bottom";
  submitted = false;
  productsList: any;
  allProductCategories: any;
  Model: any = new Products();
  ModuleName: any = "Products"
  modalOptions: NgbModalOptions;
  modalReference: NgbModalRef;
  closeResult: string;
  actionType: boolean = true;
  productsform: any
  public defaultItem: { Name: string; Id: number } = {
    Name: "-- Select --",
    Id: null,
  };
  isDuplicateProduct: boolean = false;
  productNameExissts: string;

  constructor(public _appService: AppService,
    public rmmapi: RMMApiService,
    private notifyService: NotificationService,
    public env: EnvService,
    private modalService: NgbModal) {
    this.productsform = new FormGroup({
      ProductsName: new FormControl("", Validators.required),
      categoriesid: new FormControl("", Validators.required),

    });
  }

  ngOnInit(): void {
    this._appService.setHeaderUserName(this.rmmapi.getUserName());
    this._appService.setMasterDataShow(false);
    this.setDefaults();
    this.getProducts();
    const sessionTab = this.rmmapi.getStorage(this.env.CurrentTabState.TabName);
    if (sessionTab !== undefined && sessionTab !== 'undefined' && sessionTab !== null) {
      const tempSubMenuArray = [
        'Products',
        'ProductCategories']
      if (tempSubMenuArray.find(item => item == sessionTab)) {
        this.tabchange(sessionTab);
      }  else {
        this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
      }
    }

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
    this.getProducts();
  }
  sortChange(sort: SortDescriptor[]): void {
    this.searchFilter.sort = sort[0].dir != undefined ? sort[0].field + " " + sort[0].dir : "Name asc";
    this.sort = sort;
    this.getProducts();
  }
  getProducts() {
    let params = new HttpParams().set("PageSize", this.searchFilter.pageSize.toString()).set("PageNumber", this.searchFilter.pageNumber.toString())
      .set("Sort", this.searchFilter.sort);
    this.rmmapi.getData("Products/GetAllProducts", params).toPromise().then((res: any) => {
      this.productsinfo = res.Data;
      this.productList = {
        data: res.Data.ProductsDetailList,
        total: res.Data.ProductsDetailList && res.Data.ProductsDetailList.length > 0 ? res.Data.ProductsDetailList[0].TotalRecords : 0
      };

    });
  }
  getAllProductCategories() {

    this.rmmapi.getData("Products/GetProductProductCategories").toPromise().then((res: any) => {

      this.allProductCategories = res.Data;

    });
  }
  openProductsPopUp(content) {
    this.actionType = true;
    this.productsform.reset();
    this.isDuplicateProduct = false;
    this.submitted = false;
    this.Model.Id = 0;
    this.Model = new Products();
    this.getAllProductCategories();
    this.modalReference = this.modalService.open(content, { size: 'lg' });
    this.modalReference.result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  saveProducts() {
    this.submitted = true;
    this.Model.Name = this.Model.Name != undefined ? this.Model.Name.trim() : '';
    if (this.productsform.valid && this.Model.Name.trim() !== '') {

      this.rmmapi.getData("Products/CheckDuplicateProducts?products=" + this.Model.Name.trim() + "&id=" + (this.Model.Id ? this.Model.Id : 0)).toPromise().then((res: any) => {
        this.isDuplicateProduct = res.Data;
        if (!this.isDuplicateProduct) {
          if (this.Model.Id > 0) {
            this.Model.UpdatedBy = "";
            this.Model.UpdatedDate = new Date();
            this.rmmapi.postData("Products/UpdateProduct", this.Model).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                  this.notifyService.showSuccess("", "Product updated successfully");
                
                  this.getProducts();
                this.modalReference.close();
              } else {
                this.notifyService.showError("","Sorry, Product Category could not be updated");
              }
            });
          }
          else {
            this.Model.CreatedBy = "";
            this.Model.CreatedDate = new Date();
            this.Model.Name = this.Model.Name;
            this.rmmapi.postData("Products/AddProduct", this.Model).toPromise().then((resp: any) => {
              if (resp && resp.Status) {
                this.notifyService.showSuccess("", "Product added successfully");
                
                this.getProducts();
                this.modalReference.close();
              } else {
                this.notifyService.showError("", "Sorry, Product could not be added");
              }
            });
          }
        }
      });
    }
  }

  editProducts(value1: any, value2: any) {

    this.isDuplicateProduct = false;
    if (this.rmmapi.getRolePrivilege('VP') && this.rmmapi.getRolePrivilege('MP')) {

      this.actionType = false;
      this.getAllProductCategories();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
     
      this.Model.ProductCategoriesId = value2.ProductCategoriesId;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });

    }
    else {
      this.productsform.controls["ProductsName"].disable();
      this.productsform.controls["categoriesid"].disable();
      this.actionType = false;
      this.getAllProductCategories();
      this.Model.Id = value2.Id
      this.Model.Name = value2.Name;
      this.Model.ProductCategoriesId = value2.ProductCategoriesId;
      this.modalReference = this.modalService.open(value1, { size: 'lg' });
    }
  }

  deleteProducts(value) {
    this.Model.UpdatedBy = "";
    this.Model.UpdatedDate = new Date();
    this.rmmapi.postData("Products/DeleteProduct", this.Model).toPromise().then((resp: any) => {

      if (resp && resp.Status) {
        if (resp.Data == -1) {
          this.getProducts();
          this.notifyService.showSuccess("", "Product inactivated successfully");

        } else {
          this.notifyService.showWarning("", "Sorry, this Product could not be inactivated because it is referred by another active item");
        }
      } else {
        this.notifyService.showError("", "Error: unable to inactivate the product");
      }
      this.modalReference.close();
    });
  }
  InActiveModalInfo(value1: any, value2: any) {
    this.Model.Id = value2.Id
    this.Model.Name = value2.Name;
    this.modalReference = this.modalService.open(value1, { size: 'sm' });
  }
 
  checkDuplicate() {
    if (this.Model.Name.trim().length == 0) {
      this.Model.Name = '';
      this.productsform.markAsUnTouched();
      return;

    }
   
    this.rmmapi.getData("Products/CheckDuplicateProducts?products=" + this.Model.Name.trim() + "&id=" + (this.Model.Id ? this.Model.Id : 0)).toPromise().then((res: any) => {
      this.isDuplicateProduct = res.Data;
      if (this.isDuplicateProduct) {
        this.productNameExissts = this.Model.Name + ' ' + res.Message;
        this.productsform.controls["ProductsName"].setErrors({ 'incorrect': true });
      } else {
        this.productsform.controls["ProductsName"].setErrors(null);
      }
    });
  }
  tabchange(tabname) {
    this.ModuleName = tabname;
    this.rmmapi.removeStorage(this.env.CurrentTabState.TabName);
    this.rmmapi.setStorage(this.env.CurrentTabState.TabName, tabname);
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

}

