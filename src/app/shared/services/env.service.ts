import { Injectable } from '@angular/core';
import { RMMApiService } from './rmmapi.service';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  // The values that are defined here are the default values that can
  // be overridden by env.js
  // API url
  public apiUrl = '';
  public tokenApiUrl = '';
  // Whether or not to enable debug mode
  public AutoLogOutTime = 20;
  public enableDebug = true;
  public configTimerTime="30";
  public successcode="200";
  public nosessioncode="401";
  public rawMaterialModel:any;
  public magerVersions:any[]=[];
  public minorVersions:any[]=[];
  public formulationRawMaterialsInfoList: any[] = [];
  public rawMaterialsList:any[] = [];
  public suppliersInfoList:any[] = [];
  public manufacturersInfoList:any[] = [];
  public functionsInfoList:any[] = [];
  public ValidationMessages:any = {
    requiredUserMsg:'This field is required.',
    requiredLoginMsg:'This field is required.',
    requiredRawMaterialMsg:'This field is required.',
    requiredRawMaterialAEMsg:'This value already exists.',
    requiredMultiSelectRawMaterialMsg:'At least one selection is required.',
    requiredRMGeneralDetailsMsg:'This field is required.',
    requiredRMSubComponentDetailsMsg:'This field is required.',  
    requiredRMSubComponentDetailsAEMsg:'This Sub-component has already been added to this Raw Material.',
    requiredRMDocumentDetailsMsg:'This field is required.',   
    requiredChangePwdMsg:'Incorrect new password or confirm password.', 
    requiredForgotPwdMsg:'Please enter user name', 
    requiredPropertyValueTypes:'This field is required.',
    Thisvaluealreadyexists : "This value already exists.",
  };

 
  
  public CurrentTabState:any = { 
    Id: 'Id',
    TabName : 'TabName',
  }
  constructor() {
  }
}

export const BlockInvalidChar = (event) => {
  const item = ['e', 'E', '+', '-']
  // return item.find(item => item === event.key);

  if(item.find(item => item === event.key)) {
    event.target.value = event.target.value.replace(event.key,'');
  }

  if(event.target.value.length > 3) {
    if(event.target.value.indexOf('.') > 0){
      var trimValue = event.target.value.split('.');
      if(trimValue[0].length > 3){
        var dd  = trimValue[0].substring(0, 3);
        event.target.value = dd + '.'+ trimValue[1];
      }
      if(trimValue[1].length > 7) {
        var tt = trimValue[1].substring(0,7);
        event.target.value = trimValue[0] + '.' + tt;
      }
    } else {
      event.target.value = event.target.value.substring(0, 3);
    }
  }

  // const item = ['e', 'E', '+', '-']
  // // return item.find(item => item === event.key);
  // var regex = /\d{3}.\d{0,7}/;
  // //or using RegExp
  // var regex = new RegExp(regex, "g");
  // var result = regex.test(event.target.value);
  // if(!result){
  //   event.target.value = '';
  // }
  

  // const item = ['e', 'E', '+', '-']
  // return item.find(item => item === event.key);

  // if(item.find(item => item === event.key)) { 
  //   event.preventDefault();
  //   return;
  //   // .value = event.target.value.replace(event.key,'');
  // }

  // console.log(event.target.value);
  // let latestValue = event.target.value + event.key;
  //  if(latestValue.length > 3) {
  //   if(latestValue.indexOf('.') > 0){
  //     var trimValue = latestValue.split('.');
  //     if(trimValue[0].length > 3){
  //       var dd  = trimValue[0].substring(0, 2);
  //       latestValue = dd + '.'+ trimValue[1];
  //     }
  //     if(trimValue[1].length > 7) {
  //       var tt = trimValue[1].substring(0,7);
  //       latestValue = trimValue[0] + '.' + tt;
  //     }
  //   } else {
  //     if (event.keyCode !== 190 && event.keyCode !== 110) {
  //       event.preventDefault();
  //     }
  //     // event.target.value = event.target.value.substring(0, 3);
  //   }
  // }


};
