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
  @Input() customValidators: CustomValidatorsType = {};
  @Input() fieldValue: any;

  @HostBinding('class') hostClass = 'form-field';
  get isInUpdatedMode() {
    return !!Object.keys(this.fieldValue || {}).length;
  }
  cd = inject(ChangeDetectorRef);

  formControl: AbstractControl = new FormControl();

  ngOnChanges(changes: SimpleChanges): void {
    const config: DynamicControl = changes['config']?.currentValue;
    const controlKey = changes['controlKey']?.currentValue as string;
    if (config && controlKey) {
      if (this.fieldValue) this.formControl.patchValue(this.fieldValue);
      else if (this.hasValue(config)) this.formControl.patchValue(config.value);
      const customValidators = changes['customValidators']
        ?.currentValue as CustomValidatorsType;

      if (customValidators && controlKey) {
        const { sync, async } = customValidators?.[controlKey] ?? {};

        this.formControl.setValidators(
          this.resolveSyncValidators(sync, config.validators)
        );

        this.formControl.setAsyncValidators(
          this.resolveAsycValidators(async, config.asyncValidators)
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
        validatorKey === 'minLength' &&
        typeof jsonValidatorValue === 'number'
      ) {
        return Validators.minLength(jsonValidatorValue);
      }

      return Validators.nullValidator;
    });

    if (customSyncValidators && Object.keys(customSyncValidators).length) {
      let sv = Array.isArray(customSyncValidators)
        ? customSyncValidators
        : [customSyncValidators];
      sv.forEach((customSync) => {
        validatorsArray.push(
          customSync.fnReturnedType === 'VF'
            ? customSync.fn(
                customSync.validatorParam || jsonValidators[customSync.fnName]
              )
            : customSync.fn
        );
      });
    }

    return validatorsArray;
  }

  protected resolveAsycValidators(
    customAsyncValidators: CustomValidatorsType[any]['async'],
    jsonAsyncValidators: { [key: string]: unknown } = {}
  ) {
    if (customAsyncValidators && Object.keys(customAsyncValidators).length) {
      let av = Array.isArray(customAsyncValidators)
        ? customAsyncValidators
        : [customAsyncValidators];

      return av.map((customAsync) => {
        return customAsync.fnReturnedType === 'VF'
          ? customAsync.fn(
              customAsync.validatorParam ||
                jsonAsyncValidators[customAsync.fnName]
            )
          : (customAsync.fn as AsyncValidatorFn);
      });
    }
    return (_: AbstractControl) => of(null);
  }

  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    return 'value' in ctrl;
  }
}
