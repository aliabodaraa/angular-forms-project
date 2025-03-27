import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
} from '@angular/core';
import {
  BaseDynamicControl,
  dynamicControlProvider,
  sharedDynamicControlDeps,
  comparatorFn,
} from './base-dynamic-control';
import { FormArray } from '@angular/forms';
import { DynamicControlResolver } from '../dynamic-control-resolver.service';
import { ControlInjectorPipe } from '../control-injector.pipe';

@Component({
  selector: 'app-dynamic-array',
  standalone: true,
  imports: [...sharedDynamicControlDeps, ControlInjectorPipe],
  viewProviders: [dynamicControlProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset [formArrayName]="control.controlKey">
      <legend>{{ control.config.label }}</legend>
      <button class="add-button" (click)="addItem()" type="button">+</button>
      <ng-container
        *ngFor="
          let control of config_arr | keyvalue : comparatorFn;
          index as i;
          trackBy: trackByFn
        "
      >
        <!-- {{ control.value.controlType | json }}{{ control | json }} -->
        <div style="display:flex;gap: 5px;">
          <ng-container
            [ngComponentOutlet]="
              controlResolver.resolve(control.value.controlType) | async
            "
            [ngComponentOutletInjector]="
              control.key | controlInjector : control.value
            "
          ></ng-container>
          <button
            class="remove-button"
            style="width: 19%;margin-top: 22px;"
            (click)="removeItem(i)"
            type="button"
          >
            -
            <!-- {{ control.value.order }} -->
          </button>
        </div>

        <!-- {{ random }} -->
      </ng-container>
    </fieldset>
  `,
  styles: [],
})
export class DynamicArrayComponent extends BaseDynamicControl {
  @HostBinding('class') override hostClass = 'form-field-array';
  controlResolver = inject(DynamicControlResolver);
  override formControl = new FormArray<any>(
    [],
    this.resolveValidators(this.control.config)
  );
  protected comparatorFn = comparatorFn;
  random = Math.random();
  config_arr = this.control.config.controls as any[];

  addItem() {
    let mainObh = {};
    const structure = this.control.config.typingStructureOfArrayChild;
    for (const ctrlType in structure) {
      if (ctrlType === 'input') {
        mainObh = {
          controlType: ctrlType,
          label: `label ${this.formControl.length + 1 || 1}`,
          value: '',
          type: structure?.[ctrlType],
          order: this.formControl?.length || 1,
        };
      } else if (ctrlType === 'group') {
        let ctrls = {};
        let group = structure?.[ctrlType];
        for (let index = 0; index < group.fieldsNames.length; index++) {
          const fieldName = group.fieldsNames[index];
          ctrls = {
            ...ctrls,
            [fieldName]: {
              controlType: Object.keys(group.fieldsTypes[index])[0],
              value: null,
              type: Object.values(group.fieldsTypes[index])[0],
              order: index,
            },
          };
        }
        mainObh = {
          controlType: ctrlType,
          label: `${ctrlType} ${this.formControl.length + 1 || 1}`,
          order: this.formControl?.length || 1,
          controls: { ...ctrls },
        };
      }
    }

    this.config_arr.push(mainObh);
  }
  removeItem(index: number) {
    // const copyArr = this.formControl;
    // this.formControl.clear();
    this.config_arr.splice(index, 1);
    this.formControl.removeAt(index);
    // for (let index = 0; index <= copyArr.length; index++) {
    //   if (index >= this.config_arr.length) copyArr.removeAt(index);
    // }
    // this.formControl = copyArr;
  }
  trackByFn(index: number, item: any): any {
    return item.value.order;
  }
}
