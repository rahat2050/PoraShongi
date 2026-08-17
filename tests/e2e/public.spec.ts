import { expect, test, type Page } from "@playwright/test";
import { source as axeSource } from "axe-core";

async function accessibilityViolations(page: Page) {
  await page.addScriptTag({ content: axeSource });
  return page.evaluate(async () => {
    const axe = (window as unknown as {
      axe: {
        run: (
          context: Document,
          options: unknown,
        ) => Promise<{ violations: Array<{ id: string; nodes: unknown[] }> }>;
      };
    }).axe;
    const result = await axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.length }));
  });
}

const accessibilityPages = [
  ["home", "/"],
  ["login", "/login"],
  ["register", "/register"],
  ["privacy", "/privacy"],
  ["terms", "/terms"],
  ["safety", "/safety"],
  ["contact", "/contact"],
] as const;

for (const [name, path] of accessibilityPages) {
  test(`${name} has one heading and no WCAG A/AA violations`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);

    expect(await accessibilityViolations(page)).toEqual([]);
  });
}

test("dark mode remains readable and updates the document theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Dark mode চালু" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  expect(await accessibilityViolations(page)).toEqual([]);
});

test("required auth forms are blocked before any Supabase request", async ({ page }) => {
  let supabaseRequests = 0;
  page.on("request", (request) => {
    if (request.url().includes("supabase.co")) supabaseRequests += 1;
  });

  for (const path of ["/login", "/register", "/forgot-password"]) {
    await page.goto(path);
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("input:invalid, select:invalid").first()).toBeVisible();
  }

  expect(supabaseRequests).toBe(0);
});

test("homepage quick search builds teacher filters without login", async ({ page }) => {
  await page.goto("/");
  await page.locator("#quick-class").selectOption("Class 8");
  await page.locator("#quick-subject").selectOption("Mathematics");
  await page.locator("#quick-district").selectOption("Dhaka");
  await page.locator("#quick-mode").selectOption("online");
  await page.locator('form[aria-label="দ্রুত শিক্ষক খুঁজুন"] button[type="submit"]').click();
  await expect(page).toHaveURL(/\/teachers\?class=Class(?:\+|%20)8&subject=Mathematics&district=Dhaka&mode=online/);
});

test("referral URL pre-fills a sanitized referral code", async ({ page }) => {
  await page.goto("/register?ref=ps-check-123");
  await expect(page.locator("#referralCode")).toHaveValue("PSCHECK123");
});

test("login keeps a safe encoded return destination", async ({ page }) => {
  await page.goto("/login?next=%2Fdashboard%2Fschedule");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fschedule$/);
  await expect(page.getByRole("heading", { name: "আবার স্বাগতম" })).toBeVisible();
});

test("SEO, PWA and security endpoints are production-safe", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  const headers = home.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("https://porasathi.rahatahmed.site/sitemap.xml");
  expect(robots).not.toContain("localhost");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://porasathi.rahatahmed.site/");
  expect(sitemap).not.toContain("localhost");

  for (const path of ["/manifest.webmanifest", "/sw.js", "/offline.html", "/.well-known/security.txt"]) {
    expect((await request.get(path)).status()).toBe(200);
  }
});

test("mobile user menu exposes important anonymous actions", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");

  await page.goto("/");
  await page.getByRole("button", { name: "মেনু খুলুন" }).click();
  const panel = page.locator("#mobile-navigation-panel");
  await expect(panel.getByRole("link", { name: "লগইন" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "অ্যাকাউন্ট খুলুন" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "শিক্ষক খুঁজুন" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "টিউশন খুঁজুন" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "লগ আউট" })).toHaveCount(0);
});

test("mobile navigation does not overlap the visible back-to-top button", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");

  await page.goto("/");
  await page.evaluate(() => window.scrollTo(0, 900));
  const button = page.getByRole("button", { name: "উপরে যান" });
  await expect(button).toBeVisible();
  await expect(button).toHaveClass(/translate-y-0/);
  await page.waitForTimeout(250); // wait for the CSS transform transition to settle

  const overlap = await page.evaluate(() => {
    const backToTop = [...document.querySelectorAll("button")].find(
      (element) => element.getAttribute("aria-label") === "উপরে যান",
    );
    const bottomNav = document.querySelector('nav[aria-label="মোবাইল নেভিগেশন"]');
    if (!backToTop || !bottomNav) return true;
    const a = backToTop.getBoundingClientRect();
    const b = bottomNav.getBoundingClientRect();
    return !(a.bottom <= b.top || a.top >= b.bottom || a.right <= b.left || a.left >= b.right);
  });

  expect(overlap).toBe(false);
});

test("public pages do not overflow horizontally", async ({ page }) => {
  for (const path of ["/", "/login", "/register", "/privacy", "/teachers"]) {
    await page.goto(path);
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  }
});
