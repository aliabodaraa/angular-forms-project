import { ValidatorFn, Validators } from '@angular/forms';

type ValidatorKeys = keyof Omit<
  typeof Validators & { banWords: ValidatorFn },
  'prototype' | 'compose' | 'composeAsync'
>;

interface FIELD {
  label: string;
  order: number;
  validators?: {
    [key in ValidatorKeys]?: unknown;
  };
}
export interface HAS_VALUE<T = string | number> {
  value: T;
}
export interface INPUT extends FIELD, HAS_VALUE {
  controlType: 'input';
  type: string;
}

export interface CHECKBOX extends FIELD, HAS_VALUE<boolean> {
  controlType: 'checkbox';
  type: string;
}
export interface RADIO extends FIELD {
  controlType: 'radio';
  ctrlValues: any[];
}
interface OPTION<T> extends HAS_VALUE<T> {
  label: string;
}
export interface SELECT<T = string> extends FIELD, HAS_VALUE<any> {
  controlType: 'select';
  options: OPTION<T>[];
}
export interface GROUP extends FIELD {
  controlType: 'group';
  controls: Record<string, DynamicControl>;
}
export interface ARRAY extends FIELD {
  controlType: 'array';
  isRemovable: boolean;
  isAddable: boolean;
  childArrayStructure: ChildArrayStructure;
  controls: DynamicControl[];
}
export type DynamicControl = INPUT | CHECKBOX | RADIO | SELECT | GROUP | ARRAY;
export interface DynamicFormConfig {
  description: string;
  controls: Record<string, DynamicControl>;
}

//---------ChildArrayStructure--------

type InputTypes =
  | 'text'
  | 'password'
  | 'email'
  | 'tel'
  | 'search'
  | 'number'
  | 'date'
  | 'datetime-local'
  | 'month'
  | 'week'
  | 'time'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'image'
  | 'rang'
  | 'color'
  | 'hidden';

export interface InputField {
  controlType: 'input';
  defaultCreationValue: string | number;
  type: InputTypes;
}

export interface GroupField {
  controlType: 'group';
  defaultCreationLabel: string;
  controls: Record<string, InputField> | Record<string, GroupField>;
}

interface ArrayField {
  controlType: 'array';
  defaultCreationLabel: string;
  isRemovable: boolean;
  isAddable: boolean;
  controls: InputField[] | GroupField[];
}

export type ChildArrayStructure = InputField | GroupField | ArrayField;

//---------ChildArrayStructure--------
let case1 = {
  //case 1
  childArrayStructure: {
    controlType: 'input',
    type: 'number',
  },
};
let case2 = {
  //case 2
  childArrayStructure: {
    controlType: 'group',
    fields: {
      0: {
        ctrlName: 'g1',
        controlType: 'group',
        label: 'Phone Group 1',
        order: 0,
        controls: {
          label: {
            controlType: 'input',
            label: 'phone label 1',
            value: '0933751751',
            type: 'text',
            order: 0,
          },
          phoneNumber: {
            controlType: 'input',
            label: 'phone 1',
            value: '0962636524',
            type: 'number',
            order: 1,
          },
        },
      },
    },
  },
};
let case3 = {
  //case 3
  childArrayStructure: {
    controlType: 'array',
    fields: [
      {
        ctrlName: 'c1',
        controlType: 'input',
        type: 'number',
      },
    ],
  },
};
let case4 = {
  //case 4
  childArrayStructure: {
    controlType: 'array',
    fields: [
      [
        {
          ctrlName: 'c1',
          controlType: 'input',
          type: 'number',
        },
      ],
    ],
  },
};
