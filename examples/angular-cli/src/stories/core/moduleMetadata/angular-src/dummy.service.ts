import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DummyService {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor() {}

  getItems() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(['Joe', 'Jane']);
      }, 2000);
    });
  }
}
