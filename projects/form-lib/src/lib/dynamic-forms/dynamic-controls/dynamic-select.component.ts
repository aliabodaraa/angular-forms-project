import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
} from './base-dynamic-control';
import { SELECT } from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-select',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  viewProviders: [dynamicControlProvider],
  template: `
    <label [for]="controlKey">{{ configSelect?.label }}</label>
    <select
      [formControlName]="controlKey"
      [id]="controlKey"
      [value]="configSelect?.value"
    >
      <option
        *ngFor="let option of configSelect?.options"
        [value]="option?.value"
      >
        {{ option?.label }}
      </option>
    </select>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSelectComponent extends BaseDynamicControl {
  get configSelect(): SELECT | null {
    return this.config as SELECT;
  }
}
