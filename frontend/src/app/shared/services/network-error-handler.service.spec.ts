import { TestBed } from '@angular/core/testing';

import { NetworkErrorHandlerService } from './network-error-handler.service';

describe('NetworkErrorHandlerService', () => {
  let service: NetworkErrorHandlerService;

  beforeAll(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
