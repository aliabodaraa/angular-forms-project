import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  inject,
  Optional,
  SimpleChanges,
  SkipSelf,
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
    <fieldset [formArrayName]="controlKey">
      <legend>{{ config.label }}</legend>
      <button
        *ngIf="isAddable"
        class="add-button"
        (click)="addCtrl()"
        type="button"
      >
        +
      </button>
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
            *ngIf="isRemovable"
            class="remove-button"
            style="width: 20%;margin-top: 22px;"
            (click)="removeCtrl(i)"
            type="button"
          >
            -
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
  constructor(@Optional() @SkipSelf() public parent: DynamicArrayComponent) {
    super();
  }
  get isInsideDynamicArray() {
    return !!this.parent;
  }
  private _lastOrder = 0;
  get lastOrder() {
    return this._lastOrder;
  }
  set lastOrder(newOrder) {
    this._lastOrder = newOrder;
  }
  controlResolver = inject(DynamicControlResolver);
  override formControl = new FormArray<any>([]);
  protected comparatorFn = comparatorFn;
  arrayControls: ARRAY['controls'] = [];
  isAddable: boolean = true;
  isRemovable: boolean = true;

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    if (changes['config']?.currentValue?.controls) {
      this.arrayControls = changes['config']?.currentValue?.controls;
      this.lastOrder = this.arrayControls.length ?? 0;
      this.isAddable = this.configArray.isAddable ?? this.isAddable;
      this.isRemovable = this.configArray?.isRemovable ?? this.isRemovable;
    }
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.formControl.valueChanges.subscribe((values) => {
      console.log(values);
    });
  }

  addCtrl() {
    let childStructure = this.configArray.childArrayStructure;
    if (!childStructure) {
      //issue: this condition is respecting the edge case when we have 2 nested formArray to make the (addition-action) work correctly for the newly added controls
      //need refactoring: when we are gonna have more than two nested formArray /we can still Ascend to the parent until we reach to the root FormArray instead of the direct parent only/
      childStructure = (
        (this.parent.config as ARRAY).childArrayStructure as Partial<{
          childArrayStructure: ChildArrayStructure;
        }>
      ).childArrayStructure!;
      if (!childStructure)
        throw new Error(
          '//You should provide childArrayStructure jsonObject in the corresponding json file//'
        );
    }

    const newCtrl = this.buildDesiredObjectStructure(
      childStructure
    ) as DynamicControl;
    this.lastOrder++;
    this.arrayControls.push(newCtrl);
  }

  private buildDesiredObjectStructure(
    childStructure: ChildArrayStructure,
    lastOrder: number = this.lastOrder
  ) {
    let newCtrl = {};
    if (childStructure.controlType === 'input') {
      newCtrl = {
        controlType: childStructure.controlType,
        label: `${childStructure.controlType} ${lastOrder + 1}`,
        value: childStructure.defaultCreationValue,
        type: childStructure.type,
        order: this.lastOrder,
      };
    } else if (childStructure.controlType === 'group') {
      let group = childStructure.controls;
      let ctrls = {};
      Object.values(group).forEach((ctrl, index) => {
        const ctrlName = Object.keys(group)[index];
        ctrls = {
          ...ctrls,
          [ctrlName]: this.buildDesiredObjectStructure(
            ctrl,
            index
          ) as DynamicControl,
        };
      });
      newCtrl = {
        controlType: childStructure.controlType,
        label: `${childStructure.defaultCreationLabel || ''} ${lastOrder + 1}`,
        order: lastOrder,
        controls: ctrls,
      };
    } else if (childStructure.controlType === 'array') {
      let array = childStructure.controls;
      let ctrls: ARRAY['controls'] = [];
      array.forEach((ctrl, index) => {
        ctrls.push(
          this.buildDesiredObjectStructure(ctrl, index) as DynamicControl
        );
      });
      newCtrl = {
        controlType: childStructure.controlType,
        label: `${childStructure.defaultCreationLabel || ''} ${lastOrder + 1}`,
        order: lastOrder,
        controls: ctrls,
        isAddable: childStructure.isAddable,
        isRemovable: childStructure.isRemovable,
      };
    }

    return newCtrl;
  }

  removeCtrl(index: number) {
    this.formControl.removeAt(index);
    this.arrayControls.splice(index, 1);
  }

  trackByFn(_: number, item: any): number {
    return item.value.order;
  }
}
