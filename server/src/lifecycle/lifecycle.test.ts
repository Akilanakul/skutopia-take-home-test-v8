// Based on https://macklin.me/understanding-and-managing-the-node-js-application-lifecycle

import { expect } from 'chai';
import { lifecycle } from './lifecycle';

describe('lifecycle', () => {
  after(() => {
    lifecycle._reopenAfterTest();
  });
  it('is open should return true', async () => {
    expect(lifecycle.isOpen()).to.eq(true);
  });

  it('close should fire listeners', async () => {
    let closed = false;
    lifecycle.on('close', async () => {
      closed = true;
    });
    await lifecycle.close(0);
    expect(closed).to.eq(true);
  });

  it('is open should return false', async () => {
    expect(lifecycle.isOpen()).to.eq(false);
  });
});
