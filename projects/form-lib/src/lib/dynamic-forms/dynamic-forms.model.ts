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
  type: 'input';
}

export interface CHECKBOX extends FIELD, HAS_VALUE<boolean> {
  controlType: 'checkbox';
  type: 'checkbox';
}
export interface RADIO<T = string> extends FIELD, HAS_VALUE<T> {
  controlType: 'radio';
  ctrlValues: (FIELD & HAS_VALUE<T>)[];
}
interface OPTION<T> extends HAS_VALUE<T> {
  label: string;
}
export interface SELECT<T = string> extends FIELD, HAS_VALUE<T> {
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

//---------The Following Types Made To Achieve StrictTypeing On The Property ChildArrayStructure Get From FormArray Json Config--------

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
