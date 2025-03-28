import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  Input,
  SimpleChanges,
} from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
  comparatorFn,
} from './base-dynamic-control';
import { FormArray } from '@angular/forms';
import { DynamicControlResolver } from '../dynamic-control-resolver.service';
import {
  ARRAY,
  ChildArrayStructure,
  DynamicControl,
} from '../dynamic-forms.model';

@Component({
  selector: 'app-dynamic-array',
  standalone: true,
  imports: [...sharedDynamicControlDeps],
  viewProviders: [dynamicControlProvider],
  template: `
    {{ lastOrder }}
    <fieldset [formArrayName]="controlKey">
      <legend>{{ config.label }}</legend>
      <button class="add-button" (click)="addItem()" type="button">+</button>
      <ng-container
        *ngFor="
          let control of arrayControls | keyvalue : comparatorFn;
          index as i;
          trackBy: trackByFn
        "
      >
        <div style="display:flex;gap: 5px;">
          <ng-container
            *ngIf="
              controlResolver.resolve(control.value.controlType)
                | async as componentType
            "
            [ngComponentOutlet]="componentType"
            [ngComponentOutletInputs]="{
              controlKey: control.key,
              config: control.value
            }"
          ></ng-container>
          <button
            class="remove-button"
            style="width: 19%;margin-top: 22px;"
            (click)="removeItem(i)"
            type="button"
          >
            -{{ control.value.order }}
          </button>
        </div>
      </ng-container>
    </fieldset>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicArrayComponent extends BaseDynamicControl {
  @HostBinding('class') override hostClass = 'form-field-array';
  get configArray(): ARRAY {
    return this.config as ARRAY;
  }
  controlResolver = inject(DynamicControlResolver);
  override formControl = new FormArray<any>([]);
  protected comparatorFn = comparatorFn;
  arrayControls: any[] = [];
  _lastOrder = this.arrayControls?.length ?? 0;
  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    console.log(changes, 'changes');
    if (changes['config'].currentValue) {
      console.log('control changes');
      this.arrayControls = this.configArray?.controls as any[];
      this.lastOrder = this.arrayControls.length ?? 0;
    }
  }
  override ngOnInit(): void {
    super.ngOnInit();
    this.formControl.valueChanges.subscribe((values) => {
      console.log(values);
    });
  }
  get lastOrder() {
    return this._lastOrder;
  }
  set lastOrder(newOrder) {
    this._lastOrder = newOrder;
  }
  addItem() {
    let newCtrl = {};

    let structure;
    structure = this.configArray.childArrayStructure;
    if (structure.controlType === 'input') {
      newCtrl = {
        controlType: structure.controlType,
        label: `${structure.controlType} ${this.lastOrder + 1}`,
        value: structure.defaultCreationValue,
        type: structure.type,
        order: this.lastOrder,
      };
      console.log(newCtrl, 'newCtrl');
    } else if (structure.controlType === 'group') {
      let ctrls = {};
      let group = structure.fields;
      Object.values(group).forEach((ctrl, index) => {
        const defaultVal = ctrl.defaultCreationValue;
        const ctrlName = Object.keys(group)[index];
        ctrls = {
          ...ctrls,
          [ctrlName]: {
            controlType: ctrl.controlType,
            label: `${ctrl.controlType} ${index + 1}`,
            value: defaultVal,
            type: ctrl.type,
            order: index,
          },
        };
      });
      newCtrl = {
        controlType: structure.controlType,
        label: `${structure.controlType} ${this.lastOrder + 1}`,
        order: this.lastOrder,
        controls: { ...ctrls },
      };
      console.log(newCtrl, 'newCtrl');
    }
    this.lastOrder++;

    this.arrayControls.push(newCtrl);
  }
  removeItem(index: number) {
    this.formControl.removeAt(index);
    this.arrayControls.splice(index, 1);
  }
  get lengthArr() {
    return this.formControl.length;
  }
  trackByFn(_: number, item: any): number {
    return item.value.order;
  }
}
