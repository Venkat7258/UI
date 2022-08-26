import { TestBed } from '@angular/core/testing';

import { UploadInterceptor } from './upload.interceptor';

describe('UploadInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      UploadInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: UploadInterceptor = TestBed.inject(UploadInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
