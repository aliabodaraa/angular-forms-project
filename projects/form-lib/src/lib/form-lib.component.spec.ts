import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLibComponent } from './form-lib.component';

describe('FormLibComponent', () => {
  let component: FormLibComponent;
  let fixture: ComponentFixture<FormLibComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLibComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
