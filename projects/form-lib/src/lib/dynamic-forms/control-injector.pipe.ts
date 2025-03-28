import { inject, Injector, Pipe, PipeTransform } from '@angular/core';
import { CONTROL_DATA } from './control-data.token';
import { DynamicControl } from './dynamic-forms.model';
import { AbstractControl, FormControl } from '@angular/forms';

@Pipe({
  name: 'controlInjector',
  standalone: true,
})
export class ControlInjectorPipe implements PipeTransform {
  private injector = inject(Injector);
  private cache = new WeakMap<object, Injector>();

  transform(controlKey: string, config: DynamicControl): Injector {
    if (!this.cache.has(config)) {
      this.cache.set(
        config,
        Injector.create({
          parent: this.injector,
          providers: [
            {
              provide: CONTROL_DATA,
              useValue: { controlKey, config },
            },
          ],
        })
      );
    }
    return this.cache.get(config)!;
  }
}
