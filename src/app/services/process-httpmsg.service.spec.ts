import { TestBed } from '@angular/core/testing';

import { ProcessHTTPMsgService } from './process-httpmsg.service';

describe('ProcessHTTPMsgService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ProcessHTTPMsgService = TestBed.inject(ProcessHTTPMsgService);
    expect(service).toBeTruthy();
  });
});
