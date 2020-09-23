import { TestBed } from '@angular/core/testing';

import { HttpFunctionsService } from './http-functions.service';

describe('HttpFunctionsService', () => {
  let service: HttpFunctionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HttpFunctionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
