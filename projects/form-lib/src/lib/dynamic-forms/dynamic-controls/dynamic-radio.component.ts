import { Component } from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
} from './base-dynamic-control';
import { ValidatorMessageContainer } from '../input-error/validator-message-container.directive';
import { RADIO } from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-radio',
  standalone: true,
  imports: [...sharedDynamicControlDeps, ValidatorMessageContainer],
  viewProviders: [dynamicControlProvider],
  template: `
    <div *ngFor="let ctrl of configRadio?.ctrlValues">
      <input
        type="radio"
        [container]="containerDir.container"
        [formControlName]="controlKey"
        [id]="ctrl.order"
        [value]="ctrl.value"
        [name]="controlKey"
      />
      <label [for]="ctrl.order">{{ ctrl?.label }}</label>
    </div>
    <ng-container
      validatorMessageContainer
      #containerDir="validatorMessageContainer"
    ></ng-container>
  `,
  styles: [
    `
      :host > div {
        display: flex;
        align-items: center;
        margin-top: 10px;
      }
      :host ::ng-deep app-input-error:not(:first-of-type) {
        display: none;
      }
    `,
  ],
})
export class DynamicRadioComponent extends BaseDynamicControl {
  get configRadio(): RADIO | null {
    return this.config as RADIO;
  }
}
