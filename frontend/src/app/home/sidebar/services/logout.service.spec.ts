import { TestBed } from '@angular/core/testing';

import { LogoutService } from './logout.service';

describe('LogoutService', () => {
  let service: LogoutService;

  beforeAll(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LogoutService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
