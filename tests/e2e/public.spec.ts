import { expect, test, type Page } from "@playwright/test";
import { source as axeSource } from "axe-core";
import { normalizeProfileImageUrl } from "../../src/lib/profile-image-url";
import { buildRatingBreakdown } from "../../src/lib/ratings";
import { isMessageWithinRetention, MESSAGE_RETENTION_HOURS } from "../../src/lib/message-retention";
import { createBlogSlug } from "../../src/lib/blog";

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
  ["resources", "/resources"],
  ["premium", "/premium"],
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

test("lightweight motion respects reduced-motion preference", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const state = await page.locator(".motion-reveal").first().evaluate((element) => {
    const style = getComputedStyle(element);
    return { animation: style.animationName, opacity: style.opacity, transform: style.transform };
  });
  expect(state.animation).toBe("none");
  expect(state.opacity).toBe("1");
  expect(state.transform).toBe("none");
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

test("visitor homepage exposes public discovery shortcuts", async ({ page }) => {
  await page.goto("/");
  const expected = ["/teachers", "/leaderboard", "/resources", "/safety"];
  const links = page.locator("a[data-visitor-action]");
  await expect(links).toHaveCount(4);
  for (const href of expected) await expect(page.locator(`[data-visitor-action="${href}"]`)).toHaveAttribute("href", href);
});

test("homepage action cards all lead to real product routes", async ({ page, request }) => {
  await page.goto("/");

  const actions = page.locator("a[data-home-action]");
  await expect(actions).toHaveCount(13);

  const journeyLinks = page.locator("a[data-journey-step]");
  await expect(journeyLinks).toHaveCount(5);
  const expectedJourneyHrefs: Record<string, string> = {
    discover: "/teachers",
    match: "/teachers?sort=relevance",
    connect: "/teachers",
    manage: "/dashboard/schedule",
    trust: "/safety",
  };
  for (const [step, href] of Object.entries(expectedJourneyHrefs)) {
    await expect(page.locator(`[data-journey-step="${step}"]`)).toHaveAttribute("href", href);
  }

  const expectedHrefs: Record<string, string> = {
    "role-student": "/teachers",
    "role-guardian": "/teachers",
    "role-teacher": "/tuitions",
    "stat-students": "/register",
    "stat-teachers": "/teachers",
    "stat-connections": "/safety",
    "stat-tuitions": "/tuitions",
    "stat-verified": "/teachers?verified=1",
    "stat-districts": "/teachers",
    "step-১": "/dashboard/tuitions/new",
    "step-২": "/teachers",
    "step-৩": "/teachers",
    "step-৪": "/dashboard/schedule",
  };

  for (const [action, href] of Object.entries(expectedHrefs)) {
    await expect(page.locator(`[data-home-action="${action}"]`)).toHaveAttribute("href", href);
  }

  for (const href of new Set([...Object.values(expectedHrefs), ...Object.values(expectedJourneyHrefs)])) {
    const response = await request.get(href);
    expect(response.status(), `${href} should resolve`).toBeLessThan(400);
  }

  await page.locator('[data-home-action="role-student"]').click();
  await expect(page).toHaveURL(/\/teachers$/);
  await page.goBack();
  await page.locator('[data-home-action="stat-verified"]').click();
  await expect(page).toHaveURL(/\/teachers\?verified=1$/);
});

test("external profile image links normalize safely without file storage", () => {
  const drive = normalizeProfileImageUrl("https://drive.google.com/file/d/1AbCdEfGhIjKlMnOp/view?usp=sharing");
  expect(drive).toEqual({
    ok: true,
    url: "https://drive.google.com/thumbnail?id=1AbCdEfGhIjKlMnOp&sz=w1000",
    provider: "google-drive",
  });

  const dropbox = normalizeProfileImageUrl("https://www.dropbox.com/scl/fi/photo/avatar.jpg?dl=0&rlkey=abc");
  expect(dropbox.ok).toBe(true);
  if (dropbox.ok) {
    expect(dropbox.provider).toBe("dropbox");
    expect(dropbox.url).toContain("raw=1");
    expect(dropbox.url).not.toContain("dl=0");
  }

  const direct = normalizeProfileImageUrl("https://images.example.com/profile/photo.webp#preview");
  expect(direct).toEqual({
    ok: true,
    url: "https://images.example.com/profile/photo.webp",
    provider: "external",
  });

  for (const unsafe of [
    "http://images.example.com/avatar.jpg",
    "javascript:alert(1)",
    "https://localhost/avatar.jpg",
    "https://192.168.1.2/avatar.jpg",
  ]) {
    expect(normalizeProfileImageUrl(unsafe).ok, unsafe).toBe(false);
  }
});

test("teacher rating breakdown uses only valid published values", () => {
  expect(buildRatingBreakdown([
    { rating: 5, verified: true },
    { rating: 5, verified: true },
    { rating: 4, verified: true },
    { rating: 2, verified: false },
    { rating: 9, verified: true },
  ])).toEqual({
    sampleSize: 4,
    verifiedCount: 3,
    counts: { 1: 0, 2: 1, 3: 0, 4: 1, 5: 2 },
    percentages: { 1: 0, 2: 25, 3: 0, 4: 25, 5: 50 },
  });
});

test("blog slugs cannot create broken nested routes", () => {
  expect(createBlogSlug("SSC Math / ৫টি Tips?!")).toBe("ssc-math-৫টি-tips");
  expect(createBlogSlug("  পড়াশোনার   কৌশল  ")).toBe("পড়াশোনার-কৌশল");
  expect(createBlogSlug("///")).toBe("");
});

test("chat messages use a strict 48-hour retention window", () => {
  const now = Date.parse("2026-08-18T12:00:00.000Z");
  expect(MESSAGE_RETENTION_HOURS).toBe(48);
  expect(isMessageWithinRetention("2026-08-16T12:00:01.000Z", now)).toBe(true);
  expect(isMessageWithinRetention("2026-08-16T11:59:59.000Z", now)).toBe(false);
  expect(isMessageWithinRetention("not-a-date", now)).toBe(false);
});

test("message retention policy is visible to users", async ({ page }) => {
  for (const path of ["/privacy", "/terms"]) {
    await page.goto(path);
    await expect(page.getByText(/৪৮ ঘণ্টা/).first()).toBeVisible();
  }
});

test("account export and deletion routes are protected", async ({ page, request }) => {
  for (const path of ["/account/export", "/account/delete"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
  expect((await request.get("/api/account/export")).status()).toBe(401);
});

test("premium WhatsApp contact uses the approved admin number", async ({ page }) => {
  await page.goto("/premium");
  const link = page.getByRole("link", { name: /WhatsApp-এ যোগাযোগ করুন/ });
  await expect(link).toHaveAttribute("href", /https:\/\/wa\.me\/8801626224878\?text=/);
  await expect(page.getByText("01626224878")).toBeVisible();
});

test("resource creation route is protected", async ({ page }) => {
  await page.goto("/dashboard/resources/new");
  if (new URL(page.url()).pathname === "/dashboard/resources/new") await expect(page.getByText("Supabase সেটআপ প্রয়োজন")).toBeVisible();
  else await expect(page).toHaveURL(/\/login/);
});

test("admin tuition featuring route is protected", async ({ page }) => {
  await page.goto("/admin/tuitions");
  await expect(page).toHaveURL(/\/login/);
});

test("saved tuitions dashboard preserves the anonymous return destination", async ({ page }) => {
  await page.goto("/dashboard/saved-tuitions");
  if (new URL(page.url()).pathname === "/dashboard/saved-tuitions") {
    await expect(page.getByText("Supabase সেটআপ প্রয়োজন")).toBeVisible();
  } else {
    await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fsaved-tuitions$/);
  }
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

test("missing dynamic records return real HTTP 404 responses", async ({ request }) => {
  for (const path of [
    "/teachers/not-a-valid-id",
    "/tuitions/not-a-valid-id",
    "/coaching/not-a-valid-id",
    "/blog/definitely-missing",
  ]) {
    expect((await request.get(path)).status(), path).toBe(404);
  }
});

test("teacher and admin blog author links resolve to the protected editor", async ({ page }) => {
  await page.goto("/blog/new");
  await expect(page).toHaveURL(/\/login\?next=%2Fblog%2Fnew$/);

  await page.goto("/admin/blog/new");
  await expect(page).toHaveURL(/\/login\?next=%2Fblog%2Fnew$/);
});

test("SEO, PWA and security endpoints are production-safe", async ({ request }) => {
  const home = await request.get("/");
  expect(home.status()).toBe(200);
  const headers = home.headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("img-src 'self' data: blob: https:");
  expect(headers["content-security-policy"]).not.toContain("api.cloudinary.com");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();

  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("https://porasathi.rahatahmed.site/sitemap.xml");
  expect(robots).not.toContain("localhost");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://porasathi.rahatahmed.site/");
  expect(sitemap).toContain("https://porasathi.rahatahmed.site/blog");
  expect(sitemap).toContain("https://porasathi.rahatahmed.site/coaching");
  expect(sitemap).not.toContain("localhost");

  const health = await request.get("/api/health");
  expect([200, 503]).toContain(health.status());
  const healthBody = await health.json();
  expect(healthBody.database.check).toBe("site_stats");
  if (healthBody.supabaseEnvConfigured) {
    expect(health.status()).toBe(200);
    expect(healthBody.database).toMatchObject({ reachable: true, status: 200 });
  } else {
    expect(health.status()).toBe(503);
    expect(healthBody.status).toBe("degraded");
  }

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
  await expect(panel.getByRole("link", { name: "শিক্ষা ব্লগ" })).toBeVisible();
  await expect(panel.getByRole("link", { name: "কোচিং সেন্টার" })).toBeVisible();
  await expect(panel.getByRole("button", { name: "লগ আউট" })).toHaveCount(0);
  await expect(page.locator('nav[aria-label="মোবাইল নেভিগেশন"]').getByRole("link", { name: "সেভড" })).toHaveCount(0);

  const panelBox = await panel.boundingBox();
  const viewport = page.viewportSize();
  expect(panelBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(panelBox!.height).toBeGreaterThan(viewport!.height - 80);
});

test("normal account menu never exposes admin identity or controls", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");

  await page.route("**/api/session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      authenticated: true,
      user: {
        id: "00000000-0000-4000-8000-000000000001",
        email: "teacher@example.com",
        name: "সাধারণ শিক্ষক",
        role: "teacher",
        accountStatus: "active",
      },
      unreadNotifications: 0,
    }),
  }));

  await page.goto("/");
  await page.getByRole("button", { name: "মেনু খুলুন" }).click();
  const panel = page.locator("#mobile-navigation-panel");
  await expect(panel.getByText("সাধারণ শিক্ষক", { exact: true })).toBeVisible();
  await expect(panel.locator('a[href="/admin"]')).toHaveCount(0);
  await expect(panel.getByText(/সুপার অ্যাডমিন/)).toHaveCount(0);
  await expect(panel.getByRole("link", { name: "সেভ করা টিউশন" })).toHaveAttribute("href", "/dashboard/saved-tuitions");

  const bottomNav = page.locator('nav[aria-label="মোবাইল নেভিগেশন"]');
  await expect(bottomNav.getByRole("link", { name: "সেভড" })).toHaveAttribute("href", "/dashboard/saved-tuitions");
  await expect(bottomNav.getByRole("link", { name: "খুঁজুন" })).toHaveCount(0);
});

test("super admin controls remain visible only with the server capability", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");

  await page.route("**/api/session", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      authenticated: true,
      user: {
        id: "00000000-0000-4000-8000-000000000002",
        email: "owner@example.com",
        name: "প্ল্যাটফর্ম মালিক",
        role: "teacher",
        adminLevel: "super_admin",
        accountStatus: "active",
      },
      unreadNotifications: 0,
    }),
  }));

  await page.goto("/");
  await page.getByRole("button", { name: "মেনু খুলুন" }).click();
  const panel = page.locator("#mobile-navigation-panel");
  await expect(panel.getByText("প্ল্যাটফর্ম মালিক", { exact: true })).toBeVisible();
  await expect(panel.getByRole("link", { name: "সুপার অ্যাডমিন" })).toHaveAttribute("href", "/admin");
});

test("visitor mobile CTA appears after scrolling", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");
  await page.goto("/");
  const cta = page.locator("[data-visitor-mobile-cta]");
  await page.evaluate(() => window.scrollTo(0, 800));
  await expect(cta).toHaveClass(/opacity-100/);
  await expect(cta).toHaveAttribute("href", "/teachers");
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

test("mobile footer content stays above the fixed bottom navigation", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith("mobile"), "mobile-only regression");

  await page.goto("/privacy");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.waitForFunction(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1);

  const clearance = await page.evaluate(() => {
    const footerBottom = document.querySelector("[data-footer-bottom]");
    const bottomNav = document.querySelector('nav[aria-label="মোবাইল নেভিগেশন"]');
    if (!footerBottom || !bottomNav) return -1;
    return bottomNav.getBoundingClientRect().top - footerBottom.getBoundingClientRect().bottom;
  });

  expect(clearance).toBeGreaterThanOrEqual(16);
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
