
// @ts-nocheck
// Sample mobile test for the Critter framework.  This test uses the
// global WebdriverIO runner (browser) and simple assertions to verify that
// the mobile session is active.  If you wish to use an assertion library
// like Chai, install it as a dependency and remove this ts-nocheck comment.
import { expect } from 'chai';

describe('sample mobile test', () => {
  it('should open the app and check something', async () => {
    // In WebdriverIO mobile tests, the global `browser` object is used.
    const activity = await (browser as any).getCurrentActivity?.();
    expect(activity).to.exist;
  });
});