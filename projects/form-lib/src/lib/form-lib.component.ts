import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { LIB_CONFIG } from './lib-config';
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DynamicControlResolver } from './dynamic-forms/dynamic-control-resolver.service';
import { ControlInjectorPipe } from './dynamic-forms/control-injector.pipe';
import { comparatorFn } from './dynamic-forms/dynamic-controls/base-dynamic-control';
import { bufferCount, filter, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'lib-form',
  imports: [CommonModule, ReactiveFormsModule, ControlInjectorPipe],
  template: `
    <div
      *ngIf="form && config$ | async as formConfig"
      class="dynamic-form-container"
    >
      <h3 class="form-heading">{{ formConfig.description }}</h3>
      <ng-container
        *ngFor="let control of formConfig.controls | keyvalue : comparatorFn"
      >
        <ng-container
          [ngComponentOutlet]="
            controlResolver.resolve(control.value.controlType) | async
          "
          [ngComponentOutletInjector]="
            control.key | controlInjector : control.value
          "
        ></ng-container>
      </ng-container>

      <div class="extenal-controls">
        <ng-content></ng-content>
      </div>

      <button [disabled]="form?.invalid">Save</button>
    </div>
  `,
  styles: `
  .extenal-controls{
    margin: 12px 0;
    display: flex
;
    flex-direction: column;
    gap: 12px 0;
  }
  `,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormLibComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  protected controlResolver = inject(DynamicControlResolver);
  protected comparatorFn = comparatorFn;
  public config$ = inject(LIB_CONFIG);
  public form = inject(ControlContainer, {
    optional: true,
  })?.formDirective as FormGroup | null | undefined;

  ngOnInit(): void {
    this.form?.statusChanges
      ?.pipe(
        bufferCount(2, 1),
        filter(
          ([prevState, nextState]) =>
            prevState === 'INVALID' && nextState === 'VALID'
        ),
        take(1)
      )
      .subscribe((stateVal) => {
        console.log('stateVal', stateVal);
        this.cdr.detectChanges();
      });
  }
}
