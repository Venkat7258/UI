import { AbstractControl, ValidatorFn } from '@angular/forms';

export default class WhiteSpaceValidation {
  static match(controlName: string, checkControlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
      const control = controls.get(controlName);
      const checkControl = controls.get(checkControlName);

      if (checkControl.errors && !checkControl.errors.matching) {
        return null;
      }

      if (control.value !== checkControl.value) {
        controls.get(checkControlName).setErrors({ matching: true });
        return { matching: true };
      } else {
        return null;
      }
    };
  }

  static WhiteSpaceCheck(controlName: string): ValidatorFn {
    return (controls: AbstractControl) => {
     
      
      let checkControl = controls.get(controlName);
      if (checkControl!== undefined 
        && checkControl != null 
        && checkControl.value != null
        && checkControl.value.length > 0 
        && checkControl.value.length == 0) {
           checkControl.setErrors({ require: true });
           checkControl.setValue(checkControl.value);
        console.log('whieSpaceCheck Count: ' +  checkControl.value.length );
        return { whiteSpace: true };
      } else {
        return null;
      }
    };
  }
}
