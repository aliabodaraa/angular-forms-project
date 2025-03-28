import { Component } from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
} from './base-dynamic-control';
import { FormArray } from '@angular/forms';

@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  viewProviders: [dynamicControlProvider],
  template: `
    <label [for]="control.controlKey">{{ control.config.label }}</label>
    <input
      [formControlName]="control.controlKey"
      [value]="control.config.value"
      [id]="control.controlKey"
      [type]="control.config.type"
    />
  `,
})
export class DynamicInputComponent extends BaseDynamicControl {
  constructor() {
    super();
  }
  get value() {
    return this.control.config.type === 'number'
      ? Number(this.control.config.value)
      : this.control.config.value;
  }
}
