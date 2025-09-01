import { test as base } from '@playwright/test';
import type { Page } from '@playwright/test';
import { AutomationExercise } from '../pages/automation-exercise/AutomationExercise';

export type Fixtures = { automationExercise: AutomationExercise };

// @ts-expect-error TS2347 – base is any in this env; ignore generic here
export const test = base.extend<Fixtures>({
  ae: async ({ page }: { page: Page }, use: (automationExercise: AutomationExercise) => Promise<void>) => {
    const automationExercise = new AutomationExercise(page);
    await use(automationExercise);
  },
});

export { expect } from '@playwright/test';
