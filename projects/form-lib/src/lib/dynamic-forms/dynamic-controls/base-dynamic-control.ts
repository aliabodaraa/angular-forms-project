import { CommonModule, KeyValue } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  inject,
  Input,
  OnInit,
  SimpleChanges,
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
import { DynamicControl, HAS_VALUE } from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../input-error/dynamic-validator-message.directive';

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
  @Input() controlKey: string;
  @Input() config: DynamicControl;
  @Input() value: any;

  @HostBinding('class') hostClass = 'form-field';

  cd = inject(ChangeDetectorRef);

  formControl: AbstractControl = new FormControl();

  ngOnChanges(changes: SimpleChanges): void {
    const config: DynamicControl = changes['config']?.currentValue;

    if (config) {
      if (this.hasValue(config)) this.formControl.patchValue(config.value);
      (this.formControl as any)._updateOn =
        config.updateOn || this.parentGroupDir.control?.updateOn || 'change';
      if (this.formControl.updateOn !== 'submit')
        //move form here to enable adding the json validators to the form in case updateOn is submitted
        this.formControl.setValidators(
          this.resolveJonSyncValidators(config?.validators)
        );
    }
  }

  protected parentGroupDir = inject(ControlContainer);

  ngOnInit() {
    try {
      if (this.parentGroupDir.control instanceof FormArray) {
        this.parentGroupDir.control.push(this.formControl);
      } else
        (this.parentGroupDir.control as FormGroup).addControl(
          this.controlKey,
          this.formControl
        );
    } catch (e) {
      console.log(e, '---', this.formControl);
    }
  }

  protected resolveJonSyncValidators(
    jsonValidators: { [key: string]: unknown } | undefined = {}
  ) {
    let validatorsArray = (
      Object.keys(jsonValidators) as Array<keyof typeof jsonValidators>
    ).map((validatorKey) => {
      const jsonValidatorValue = jsonValidators[validatorKey];
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
        typeof jsonValidatorValue === 'number' ||
        typeof jsonValidatorValue === 'string'
      ) {
        if (validatorKey === 'min') {
          return Validators.min(+jsonValidatorValue);
        }
        if (validatorKey === 'max') {
          return Validators.max(+jsonValidatorValue);
        }
        if (validatorKey === 'minLength') {
          return Validators.minLength(+jsonValidatorValue);
        }
      }
      return Validators.nullValidator;
    });

    return validatorsArray;
  }

  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    return 'value' in ctrl;
  }
}
