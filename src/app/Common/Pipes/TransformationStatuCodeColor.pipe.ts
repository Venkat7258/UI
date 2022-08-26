import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'TransformationStatuCodeColor' })
export class TransformationStatuCodeColor implements PipeTransform {
    transform(value: string, tableName: string): string {

        var temp = 'badge ';
        value = value.toUpperCase();

        if (tableName === 'formulationList') {
            if ('ILA' == value) {
                return temp + ' badge-success badge-text-wrapper';
            } else if ('ILS' == value) {
                return temp + " badge-warning badge-text-wrapper";
            }
            else if ('FSS' == value) { return temp + " badge-warning badge-text-wrapper"; }
            else if ('FSA' == value) { return temp + " badge-primary badge-text-wrapper"; }
            else if ('FSN' == value) { return temp + " badge-light badge-text-wrapper"; }
            else if ('FMC' == value) { return temp + " badge-info badge-text-wrapper"; }
            else {
                return temp + 'badge-light';
            }
        } else if (tableName === 'supplierRawMaterial') {
            if ('NEW' === value) {
                return temp + ' badge-light'
            } else if ('RM DETAILS COMPLETED' === value) {
                return temp + ' badge-success'
            }
            console.log(value);
        } else if (tableName === 'propertyValueTypes') {
            if ('PASS' === value) {
                return temp + ' badge-success'
            } else if ('FAIL' === value) {
                return temp + ' badge badge-danger'
            } else  {
                return temp + ' badge badge-light'
            }
        }
    }
}

// Ingredient List Approved: Green - class="badge-success"
// Ingredient List Submitted: Orange class="badge-warning"
// Formulation Summary Submitted: Orange class="badge-warning"
// Formulation Summary Approved: Blue class="badge-primary"
// Draft :#f1416c (Red) class="badge-danger"


// Supplier Raw Materials
// RM Details Completed - badge badge-success
// New - badge badge-light


// Property Value Types

// Pass - badge badge-success
// Fail - badge badge-danger
// NA - badge badge-light