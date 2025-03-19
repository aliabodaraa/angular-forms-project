import { CommonModule, KeyValue } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  inject,
  OnInit,
  StaticProvider,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CONTROL_DATA } from '../control-data.token';
import { DynamicControl } from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../dynamic-validator-message.directive';
import { banWords } from '../validators/ban-words.validator';

export const comparatorFn = (
  a: KeyValue<string, DynamicControl>,
  b: KeyValue<string, DynamicControl>
): number => a.value.order - b.value.order;

export const sharedDynamicControlDeps = [
  CommonModule,
  ReactiveFormsModule,
  DynamicValidatorMessage,
];

export const dynamicControlProvider: StaticProvider = {
  provide: ControlContainer,
  useFactory: () => inject(ControlContainer, { skipSelf: true }),
};

@Directive()
export class BaseDynamicControl implements OnInit {
  @HostBinding('class') hostClass = 'form-field';

  control = inject(CONTROL_DATA);
  cd = inject(ChangeDetectorRef);
  formControl: AbstractControl = new FormControl(
    this.control.config.value,
    this.resolveValidators(this.control.config)
  );

  protected parentGroupDir = inject(ControlContainer);

  ngOnInit() {
    try {
      if (this.parentGroupDir.control instanceof FormArray) {
        this.parentGroupDir.control.push(this.formControl);
        console.log(this.control, this.parentGroupDir.control);
      } else
        (this.parentGroupDir.control as FormGroup).addControl(
          this.control.controlKey,
          this.formControl
        );
    } catch (e) {
      console.log(e, '---', this.control, this.formControl);
    }
  }
  addToArray() {
    if (this.parentGroupDir.control instanceof FormArray) {
      this.parentGroupDir.control.push(this.formControl);
    }
  }

  protected resolveValidators({ validators = {} }: DynamicControl) {
    return (Object.keys(validators) as Array<keyof typeof validators>).map(
      (validatorKey) => {
        const validatorValue = validators[validatorKey];
        if (validatorKey === 'required') {
          return Validators.required;
        }
        if (validatorKey === 'email') {
          return Validators.email;
        }
        if (validatorKey === 'requiredTrue') {
          return Validators.requiredTrue;
        }
        if (
          validatorKey === 'minLength' &&
          typeof validatorValue === 'number'
        ) {
          return Validators.minLength(validatorValue);
        }
        if (validatorKey === 'banWords' && Array.isArray(validatorValue)) {
          return banWords(validatorValue);
        }
        return Validators.nullValidator;
      }
    );
  }
}
