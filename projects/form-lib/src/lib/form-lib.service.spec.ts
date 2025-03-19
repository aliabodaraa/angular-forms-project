import { TestBed } from '@angular/core/testing';

import { FormLibService } from './form-lib.service';

describe('FormLibService', () => {
  let service: FormLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FormLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
