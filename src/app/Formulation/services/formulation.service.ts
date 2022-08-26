import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EnvService } from 'src/app/shared/services/env.service';
import { RMMApiService } from 'src/app/shared/services/rmmapi.service';

@Injectable({
  providedIn: 'root'
})
export class FormulationService {
  constructor(public env: EnvService,private rmmapi: RMMApiService) { }
  GetFormulationRawMaterialsDetails(formulationDetailId:number) {
    //let params = new HttpParams().set("Id", formulationDetailId.toString());
    let params = new HttpParams().set("Id", formulationDetailId.toString()).set("PageSize",'10000').set("PageNumber", '0')
    .set("Sort",'Id asc');
    this.rmmapi.getData("FormulationRawMaterials/GetFormulationRawMaterials",params).toPromise().then((resp: any) => {
      this.env.formulationRawMaterialsInfoList = resp.Data.FormulationRawmaterialDetailsList;
    })
  }
  GetFormulationRawMaterials() {
    
    this.rmmapi.getData("FormulationRawMaterials/GetSupplierRawMaterialDetailsByRawMaterialId").toPromise().then((resp: any) => {
      this.env.rawMaterialsList = resp.Data;
      this.env.rawMaterialsList.forEach(element => {
        element.Name = element.Name + " (" + element.Code + ")";
      });
    })
  }
  GetSuppliers() {
    this.rmmapi.getData("Suppliers/GetSuppliers").toPromise().then((resp: any) => {
      this.env.suppliersInfoList = resp.Data;
    });
  }
  GetManufacturers() {
    this.rmmapi.getData("Manufacturers/GetManufacturers").toPromise().then((resp: any) => {
      this.env.manufacturersInfoList = resp.Data;
    })
  }
  GetFunctions() {
    this.rmmapi.getData("RawMaterialFunctions/GetRawMaterialFunctions").toPromise().then((resp: any) => {
      this.env.functionsInfoList = resp.Data;
    })
  }
}
