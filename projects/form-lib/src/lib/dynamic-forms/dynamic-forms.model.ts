import { ValidatorFn, Validators } from '@angular/forms';

export interface DynamicOptions {
  label: string;
  value: string;
}
type CustomValidators = { banWords: ValidatorFn };
type ValidatorKeys = keyof Omit<
  typeof Validators & CustomValidators,
  'prototype' | 'compose' | 'composeAsync'
>;
export interface DynamicControl<T = 'input', V = string> {
  controlType: 'input' | 'select' | 'checkbox' | 'group' | 'array';
  type?: string;
  label: string;
  typingStructureOfArrayChild?: {
    [x in 'input' | 'select' | 'checkbox' | 'group']: {
      fieldsTypes: {
        [x: number]: {
          [x in 'input' | 'select' | 'checkbox' | 'group' | 'array']:
            | 'text'
            | 'number'
            | 'email';
        };
      };
      fieldsNames: string[];
    };
  };
  order: number;
  value: V | null;
  options?: DynamicOptions[];
  controls?: DynamicFormConfig['controls'] | DynamicControl<T, V>[];
  validators?: {
    [key in ValidatorKeys]?: unknown;
  };
}
export interface DynamicFormConfig {
  description: string;
  controls: {
    [key: string]: DynamicControl;
  };
}
