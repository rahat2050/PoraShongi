import fs from "node:fs/promises";
import path from "node:path";
import { expect, test as setup } from "@playwright/test";

const password = process.env.E2E_TEST_PASSWORD;
if (!password) throw new Error("E2E_TEST_PASSWORD is required for authenticated setup.");

const accounts = [
  ["student", "student@e2e.porasathi.test"],
  ["guardian", "guardian@e2e.porasathi.test"],
  ["teacher-primary", "teacher-primary@e2e.porasathi.test"],
  ["teacher-secondary", "teacher-secondary@e2e.porasathi.test"],
  ["admin", "admin@e2e.porasathi.test"],
] as const;

for (const [name, email] of accounts) {
  setup(`authenticate ${name}`, async ({ page }) => {
    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "লগইন করুন" }).click();
    await expect(page).toHaveURL(/\/dashboard|\/admin/, { timeout: 20_000 });
    await fs.mkdir(path.resolve("tests/e2e-auth/.auth"), { recursive: true });
    await page.context().storageState({ path: path.resolve(`tests/e2e-auth/.auth/${name}.json`) });
  });
}
