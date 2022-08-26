
import {
  forwardRef,
  Directive,
  Attribute
} from '@angular/core';

import {
  Validator,
  NG_VALIDATORS
} from '@angular/forms';

export const requiredValidatorLogic = (required) => (control) => {
  if (!control.value) {
      return { valid: false };
  }

  return control.value.id && control.value.id !== null ?
      null : { valid: false };
};

const Required_VALIDATOR: any = {
 provide: NG_VALIDATORS,
 // tslint:disable-next-line:no-use-before-declare
 useExisting: forwardRef(() => RequiredValidatorLogicDirective),
 multi: true
};

@Directive({
   selector: '[isRequired]',
   providers: [Required_VALIDATOR]
})
export class RequiredValidatorLogicDirective implements Validator {
  private _validator: any;
  constructor(@Attribute('isRequired') required: boolean) {
      this._validator = requiredValidatorLogic(required);
  }
  validate(c) {
      return this._validator(c);
  }
}
