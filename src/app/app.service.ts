import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  public formulationId: number;
  public actionType: string;
  public commingFrom: string;
  public reviewCommentId: number;
  public supplierRawMaterialId: number;
  public supplierRawMaterialDocumentId: number;
  constructor() { }
  private viewHeader = new BehaviorSubject<boolean>(false);
  showHeader = this.viewHeader.asObservable();

  private viewMasterData = new BehaviorSubject<boolean>(true);
  showMasterData = this.viewMasterData.asObservable();

  private viewRawMaterial = new BehaviorSubject<boolean>(true);
  showRawMaterial = this.viewMasterData.asObservable();

  private ViewHeaderTitle = new BehaviorSubject<string>("");
  showHeaderTitle = this.ViewHeaderTitle.asObservable();

  private ViewHeaderUserName = new BehaviorSubject<string>("");
  showHeaderUserName = this.ViewHeaderUserName.asObservable();

  private ViewLoader = new BehaviorSubject<boolean>(false);
  showLoader = this.ViewLoader.asObservable();


  setHeaderShow(value: boolean) {
    this.viewHeader.next(value)
  }
  setMasterDataShow(value: boolean) {
    this.viewMasterData.next(value)
  }
  setRawMaterialShow(value: boolean) {
    this.viewRawMaterial.next(value)
  }
  setHeaderTitle(value: string) {
    this.ViewHeaderTitle.next(value)
  }

  setHeaderUserName(value: string) {
    this.ViewHeaderUserName.next(value)
  }

  enableLoader(value: boolean) {
    this.ViewLoader.next(value);
  }

  resetValues() {
    this.formulationId = 0;
    this.actionType = "";
    this.commingFrom = "";
    this.reviewCommentId = 0;
    this.supplierRawMaterialId = 0;
    this.supplierRawMaterialDocumentId = 0;
  }
}
