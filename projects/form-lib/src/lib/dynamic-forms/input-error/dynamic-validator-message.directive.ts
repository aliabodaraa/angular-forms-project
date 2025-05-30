import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewContainerRef,
} from '@angular/core';
import {
  ControlContainer,
  FormGroupDirective,
  NgControl,
  NgForm,
  NgModel,
} from '@angular/forms';
import {
  delay,
  EMPTY,
  fromEvent,
  iif,
  merge,
  skip,
  startWith,
  Subject,
  Subscription,
  take,
  tap,
} from 'rxjs';
import { ErrorStateMatcher } from './error-state-matcher.service';
import { InputErrorComponent } from './input-error.component';

@Directive({
  selector: `
    [ngModel]:not([withoutValidationErrors]),
    [formControl]:not([withoutValidationErrors]),
    [formControlName]:not([withoutValidationErrors]),
    [formGroupName]:not([withoutValidationErrors]),
    [ngModelGroup]:not([withoutValidationErrors]),
    [formArrayName]:not([withoutValidationErrors])
  `,
  standalone: true,
})
export class DynamicValidatorMessage implements OnInit, OnDestroy {
  ngControl =
    inject(NgControl, { self: true, optional: true }) ||
    inject(ControlContainer, { self: true });
  elementRef = inject(ElementRef);
  get form() {
    return this.parentContainer?.formDirective as
      | NgForm
      | FormGroupDirective
      | null;
  }
  @Input()
  errorStateMatcher = inject(ErrorStateMatcher);

  @Input()
  container = inject(ViewContainerRef);
  private firstRenderStream = new Subject<void>();
  private componentRef: ComponentRef<InputErrorComponent> | null = null;
  private errorMessageTrigger!: Subscription;
  private parentContainer = inject(ControlContainer, { optional: true });

  ngOnInit() {
    queueMicrotask(() => {
      if (!this.ngControl.control)
        throw Error(`No control model for ${this.ngControl.name} control...`);
      this.errorMessageTrigger = merge(
        this.ngControl.control.statusChanges,
        fromEvent(this.elementRef.nativeElement, 'blur'),
        iif(() => !!this.form, this.form!.ngSubmit, EMPTY),
        this.firstRenderStream
      )
        .pipe(
          startWith(this.ngControl.control.status),
          skip(this.ngControl instanceof NgModel ? 1 : 0)
        )
        .subscribe((res) => {
          if (
            this.errorStateMatcher.isErrorVisible(
              this.ngControl.control,
              this.form
            )
          ) {
            if (!this.componentRef) {
              this.componentRef =
                this.container.createComponent(InputErrorComponent);
              this.componentRef.changeDetectorRef.markForCheck();
            }
            this.componentRef.setInput('errors', this.ngControl.errors);
            this.componentRef.setInput(
              'isControlPending',
              this.ngControl.control?.pending
            );
          } else {
            this.componentRef?.destroy();
            this.componentRef = null;
          }
        });
    });
  }
  ngOnDestroy() {
    this.errorMessageTrigger.unsubscribe();
  }
  ngAfterContentInit(): void {
    setTimeout(() => this.firstRenderStream.next(), 1000); //___need_refactoring___ here ,becasuse we need to emit our value after all the control take its value
  }
}
