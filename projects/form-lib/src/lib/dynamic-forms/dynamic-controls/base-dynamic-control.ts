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
  isValidatorFunction,
} from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../input-error/dynamic-validator-message.directive';
// import { banWords } from '../validators/ban-words.validator';

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
    if (changes['config']?.currentValue) {
      if (this.hasValue(this.config))
        this.formControl.patchValue(this.config.value);
    }
    if (changes['customValidators']?.currentValue)
      this.formControl.setValidators(
        this.resolveValidators(this.controlKey, this.config)
      );
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

  protected resolveValidators(
    controlKey: string,
    { validators = {} }: DynamicControl
  ) {
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
        const fnData = Array.isArray(this.customValidators?.[controlKey])
          ? this.customValidators?.[controlKey]?.find(
              (item) => item?.fnName === validatorKey
            )
          : this.customValidators?.[controlKey];
        if (fnData?.fn && fnData?.fnName === validatorKey)
          return fnData.fnReturnedType === 'VF' &&
            isValidatorFunction(fnData.fn)
            ? fnData.fn(validatorValue)
            : fnData.fn;

        return Validators.nullValidator;
      }
    );
  }

  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    return 'value' in ctrl;
  }
}
