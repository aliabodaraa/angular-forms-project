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
  AsyncValidatorFn,
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
  ValidatorKeys,
} from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../input-error/dynamic-validator-message.directive';
import { Observable, of } from 'rxjs';

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
    const customValidators = changes['customValidators']
      ?.currentValue as CustomValidatorsType;
    const controlKey = changes['controlKey']?.currentValue as string;

    if (config) {
      if (this.hasValue(config)) this.formControl.patchValue(config.value);
      if (customValidators && controlKey) {
        const providedAsyncValidators = customValidators?.[controlKey];

        this.formControl.setValidators(
          this.resolveSyncValidators(
            providedAsyncValidators?.sync,
            config.validators
          )
        );

        if (providedAsyncValidators?.async)
          this.formControl.setAsyncValidators(
            this.resolveAsycValidators(
              providedAsyncValidators.async,
              config.asyncValidators
            )
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

  protected resolveSyncValidators(
    customSyncValidators: CustomValidatorsType[any]['sync'],
    jsonAsyncValidators = {}
  ) {
    return (
      Object.keys(jsonAsyncValidators) as Array<
        keyof typeof jsonAsyncValidators
      >
    ).map((validatorKey) => {
      const jsonValidatorValue = jsonAsyncValidators[validatorKey];
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
        typeof jsonValidatorValue === 'number'
      ) {
        return Validators.minLength(jsonValidatorValue);
      }
      //  if (validatorKey === 'banWords' && Array.isArray(jsonValidatorValue)) {
      //    return banWords(jsonValidatorValue);
      //  }
      let fnData = null;
      if (customSyncValidators)
        if (Array.isArray(customSyncValidators))
          fnData = customSyncValidators?.find(
            (item) => item?.fnName === validatorKey
          );
        else if (Object.keys(customSyncValidators).length)
          fnData = customSyncValidators;

      if (fnData && fnData.fnName === validatorKey)
        return fnData.fnReturnedType === 'VF'
          ? fnData.fn(fnData.validatorParam || jsonValidatorValue)
          : fnData.fn;

      return Validators.nullValidator;
    });
  }

  protected resolveAsycValidators(
    customAsyncValidators: CustomValidatorsType[any]['async'],
    jsonAsyncValidators: { [key: string]: unknown } | undefined
  ) {
    return (
      Object.keys(jsonAsyncValidators || {}) as Array<
        keyof typeof jsonAsyncValidators
      >
    ).map((validatorKey) => {
      const jsonValidatorValue = jsonAsyncValidators?.[validatorKey];

      let fnData = null;
      if (customAsyncValidators)
        if (Array.isArray(customAsyncValidators))
          fnData = customAsyncValidators?.find(
            (item) => item?.fnName === validatorKey
          );
        else if (Object.keys(customAsyncValidators).length)
          fnData = customAsyncValidators;

      if (fnData && fnData.fnName === validatorKey)
        return fnData.fnReturnedType === 'VF'
          ? fnData.fn(fnData?.validatorParam || jsonValidatorValue)
          : (fnData.fn as AsyncValidatorFn);

      return (control: AbstractControl) => of(null);
    });
  }

  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    let s: AsyncValidatorFn = (control: AbstractControl) => of(null);
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
