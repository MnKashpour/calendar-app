import { TestBed } from '@angular/core/testing';

import { EventSharingService } from './event-sharing.service';

describe('EventSharingService', () => {
  let service: EventSharingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventSharingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
