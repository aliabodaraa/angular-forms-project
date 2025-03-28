import { CommonModule, KeyValue } from '@angular/common';
import {
  ChangeDetectorRef,
  Directive,
  HostBinding,
  inject,
  Input,
  NgZone,
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
  ARRAY,
  CHECKBOX,
  DynamicControl,
  GROUP,
  HAS_VALUE,
  INPUT,
  RADIO,
  SELECT,
} from '../dynamic-forms.model';
import { DynamicValidatorMessage } from '../input-error/dynamic-validator-message.directive';
import { banWords } from '../validators/ban-words.validator';

interface ControlWithValue {
  value: string | number | boolean;
}
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
  @HostBinding('class') hostClass = 'form-field';

  cd = inject(ChangeDetectorRef);

  formControl: AbstractControl = new FormControl();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']?.currentValue) {
      if (this.hasValue(this.config))
        this.formControl.patchValue(this.config.value);
      this.formControl.setValidators(this.resolveValidators(this.config));
    }
  }
  protected ngZone = inject(NgZone);
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

  isGroup(d: DynamicControl): d is GROUP {
    return d.controlType === 'group';
  }
  isArray(d: DynamicControl): d is ARRAY {
    return d.controlType === 'array';
  }
  isInput(d: DynamicControl): d is INPUT {
    return d.controlType === 'input';
  }
  isSelect(d: DynamicControl): d is SELECT {
    return d.controlType === 'select';
  }
  isCheckbox(d: DynamicControl): d is CHECKBOX {
    return d.controlType === 'checkbox';
  }
  isRadio(d: DynamicControl): d is RADIO {
    return d.controlType === 'radio';
  }
  hasValue(ctrl: any): ctrl is HAS_VALUE<any> {
    return 'value' in ctrl;
  }
}
