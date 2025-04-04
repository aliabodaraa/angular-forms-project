import { Inject, Injectable, Optional, Type } from '@angular/core';
import { from, Observable, of, tap } from 'rxjs';
import { CUSTOM, DynamicControl } from './dynamic-forms.model';
import { CUSTOM_CONTROLS_COMPONENTS } from '../lib-config';

type DynamicControlsMap = {
  [T in Exclude<DynamicControl['controlType'], 'custom'>]: (
    path?: string
  ) => Promise<Type<any>>;
};

@Injectable({
  providedIn: 'root',
})
export class DynamicControlResolver {
  private lazyControlComponents: DynamicControlsMap = {
    input: () =>
      import('./dynamic-controls/dynamic-input.component').then(
        (c) => c.DynamicInputComponent
      ),
    select: () =>
      import('./dynamic-controls/dynamic-select.component').then(
        (c) => c.DynamicSelectComponent
      ),
    radio: () =>
      import('./dynamic-controls/dynamic-radio.component').then(
        (c) => c.DynamicRadioComponent
      ),
    checkbox: () =>
      import('./dynamic-controls/dynamic-checkbox.component').then(
        (c) => c.DynamicCheckboxComponent
      ),
    group: () =>
      import('./dynamic-controls/dynamic-group.component').then(
        (c) => c.DynamicGroupComponent
      ),
    array: () =>
      import('./dynamic-controls/dynamic-array.component').then(
        (c) => c.DynamicArrayComponent
      ),
  };
  constructor(
    @Optional()
    @Inject(CUSTOM_CONTROLS_COMPONENTS)
    private customControls: Map<string, Type<any>>
  ) {
    console.log('out constructor');
  }
  private loadedControlComponents = new Map<string, Type<any>>();

  resolve(control: DynamicControl) {
    if (control.controlType == 'custom') {
      return this.resolveCustomControls(control);
    }
    return this.resolveBuiltInControls(control.controlType);
  }

  private resolveBuiltInControls(controlType: keyof DynamicControlsMap) {
    const loadedComponent = this.loadedControlComponents.get(controlType);
    if (loadedComponent) {
      return of(loadedComponent);
    }
    return from(this.lazyControlComponents[controlType]()).pipe(
      tap((comp) => this.loadedControlComponents.set(controlType, comp))
    );
  }

  private resolveCustomControls(
    control: CUSTOM
  ): Observable<Type<any>> | never {
    if (this.customControls) {
      const isRegistered: boolean = Array.from(
        this.customControls.keys()
      ).includes(control.template);
      if (isRegistered) {
        return of(this.customControls.get(control.template)!);
      }
      throw `The custom control with this template: (${control.template}) doesn't register any constructor.`;
    }

    throw `No Registry provided for custom components!`;
  }
}
