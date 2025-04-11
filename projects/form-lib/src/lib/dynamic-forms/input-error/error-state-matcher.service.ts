import { Injectable } from '@angular/core';
import { AbstractControl, FormGroupDirective, NgForm } from '@angular/forms';

export interface ErrorStateMatcher {
  isErrorVisible(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null
  ): boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ErrorStateMatcher implements ErrorStateMatcher {
  isErrorVisible(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null
  ) {
    return Boolean(
      control &&
        ((control.invalid && (control.dirty || (form && form.submitted))) ||
          (control.dirty && control.pending) ||
          (control.invalid && control.pristine))
    );
  }
}
export class OnTouchedErrorStateMatcher implements ErrorStateMatcher {
  isErrorVisible(
    control: AbstractControl | null,
    form: FormGroupDirective | NgForm | null
  ) {
    return Boolean(
      control &&
        control.invalid &&
        (control.touched || (form && form.submitted))
    );
  }
}
