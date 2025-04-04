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
import {
  CustomValidatorsType,
  DynamicControl,
  HAS_VALUE,
  isAsyncValidatorFunction,
  isValidatorFunction,
  ValidatorKeys,
} from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../input-error/dynamic-validator-message.directive';
import { of } from 'rxjs';

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
  @Input() customValidators: CustomValidatorsType;
  @HostBinding('class') hostClass = 'form-field';

  cd = inject(ChangeDetectorRef);

  formControl: AbstractControl = new FormControl();

  ngOnChanges(changes: SimpleChanges): void {
    const config: DynamicControl = changes['config']?.currentValue;
    const customValidators = changes['customValidators']?.currentValue;

    if (config) {
      if (this.hasValue(config)) this.formControl.patchValue(config.value);

      if (customValidators) {
        if (this.hasSyncValidators(config))
          this.formControl.setValidators(
            this.resolveSyncValidators(this.controlKey, config.validators)
          );

        if (this.hasAsyncValidators(config))
          this.formControl.setAsyncValidators(
            this.resolveAsycValidators(this.controlKey, config.asyncValidators)
          );
      }
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

  protected resolveSyncValidators(controlKey: string, validators = {}) {
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
        //  if (validatorKey === 'banWords' && Array.isArray(validatorValue)) {
        //    return banWords(validatorValue);
        //  }

        const fnData = Array.isArray(this.customValidators?.[controlKey]?.sync)
          ? this.customValidators?.[controlKey]?.sync?.find(
              (item) => item?.fnName === validatorKey
            )
          : this.customValidators?.[controlKey]?.sync;

        if (fnData?.fn && fnData?.fnName === validatorKey)
          return fnData.fnReturnedType === 'VF' &&
            isValidatorFunction(fnData.fn)
            ? fnData.fn(validatorValue)
            : fnData.fn;

        return Validators.nullValidator;
      }
    );
  }

  protected resolveAsycValidators(controlKey: string, asyncValidators = {}) {
    return (
      Object.keys(asyncValidators) as Array<keyof typeof asyncValidators>
    ).map((validatorKey) => {
      const validatorValue = asyncValidators[validatorKey];

      const fnData = Array.isArray(this.customValidators?.[controlKey]?.async)
        ? this.customValidators?.[controlKey]?.async?.find(
            (item) => item?.fnName === validatorKey
          )
        : this.customValidators?.[controlKey]?.async;
      if (fnData?.fn && fnData?.fnName === validatorKey)
        return fnData.fnReturnedType === 'VF' &&
          isAsyncValidatorFunction(fnData.fn)
          ? fnData.fn(validatorValue)
          : fnData.fn;
      return of(null) as any;
    });
  }

  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    return 'value' in ctrl;
  }
  hasSyncValidators(ctrl: any): ctrl is {
    validators: {
      [key in ValidatorKeys]: unknown;
    };
  } {
    return 'validators' in ctrl;
  }
  hasAsyncValidators(ctrl: any): ctrl is {
    asyncValidators: {
      [key: string]: unknown;
    };
  } {
    return 'asyncValidators' in ctrl;
  }
}
