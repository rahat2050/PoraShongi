import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type Page } from "@playwright/test";

const authDir = path.resolve("tests/e2e-auth/.auth");
const fixtures = JSON.parse(fs.readFileSync(path.join(authDir, "fixtures.json"), "utf8"));
const service = createClient(
  process.env.E2E_SUPABASE_URL!,
  process.env.E2E_SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

async function actor(browser: Browser, name: string) {
  return browser.newContext({
    baseURL: "http://127.0.0.1:3000",
    storageState: path.join(authDir, `${name}.json`),
  });
}

function requestRow(page: Page, title: string) {
  return page.locator("div.border-b").filter({ hasText: title }).first();
}

test.describe.serial("authenticated tuition marketplace journeys", () => {
  test("student sends and withdraws tuition requests", async ({ browser }) => {
    const context = await actor(browser, "student");
    const page = await context.newPage();

    await page.goto(`/teachers/${fixtures.accounts.teacherPrimary.id}`);
    await page.getByRole("button", { name: /টিউশনের অনুরোধ পাঠান/ }).click();
    await page.locator("#request-tuition").selectOption(fixtures.tuitions.send.id);
    await page.locator("#request-message").fill("E2E request created from the browser");
    await page.getByRole("button", { name: "পাঠান", exact: true }).click();
    await expect(page.getByText("আপনার অনুরোধ পাঠানো হয়েছে।")).toBeVisible();

    await page.goto("/dashboard/requests");
    const withdrawRow = requestRow(page, fixtures.tuitions.withdraw.title);
    await withdrawRow.getByRole("button", { name: "প্রত্যাহার" }).click();
    await expect(page.getByText("অনুরোধ প্রত্যাহার করা হয়েছে")).toBeVisible();
    await context.close();
  });

  test("teacher rejects a pending request", async ({ browser }) => {
    const context = await actor(browser, "teacher-primary");
    const page = await context.newPage();
    await page.goto("/dashboard/requests");
    const row = requestRow(page, fixtures.tuitions.reject.title);
    await row.getByRole("button", { name: "বাতিল" }).click();
    await expect(page.getByText("অনুরোধ প্রত্যাখ্যান করা হয়েছে")).toBeVisible();
    await context.close();
  });

  test("one teacher acceptance rejects every competing request", async ({ browser }) => {
    const context = await actor(browser, "teacher-primary");
    const page = await context.newPage();
    await page.goto("/dashboard/requests");
    const row = requestRow(page, fixtures.tuitions.exclusive.title);
    await row.getByRole("button", { name: "গ্রহণ" }).click();
    await expect(page.getByText("অনুরোধ গ্রহণ করা হয়েছে")).toBeVisible();

    const { data: requests, error } = await service.from("tuition_requests")
      .select("teacher_id,status")
      .eq("tuition_id", fixtures.tuitions.exclusive.id);
    expect(error).toBeNull();
    expect(requests).toEqual(expect.arrayContaining([
      { teacher_id: fixtures.accounts.teacherPrimary.id, status: "accepted" },
      { teacher_id: fixtures.accounts.teacherSecondary.id, status: "rejected" },
    ]));
    const { data: tuition } = await service.from("tuitions").select("status").eq("id", fixtures.tuitions.exclusive.id).single();
    expect(tuition?.status).toBe("assigned");
    await context.close();
  });

  test("meeting link is visible only to involved users", async ({ browser }) => {
    const meetingUrl = "https://meet.google.com/e2e-safe-room";
    const teacher = await actor(browser, "teacher-primary");
    const teacherPage = await teacher.newPage();
    await teacherPage.goto(`/tuitions/${fixtures.tuitions.accepted.id}`);
    await teacherPage.getByPlaceholder(/meet\.google\.com/).fill(meetingUrl);
    await teacherPage.getByRole("button", { name: "সেভ", exact: true }).click();
    await expect(teacherPage.getByText("মিটিং লিংক সেভ হয়েছে")).toBeVisible();

    const student = await actor(browser, "student");
    const studentPage = await student.newPage();
    await studentPage.goto(`/tuitions/${fixtures.tuitions.accepted.id}`);
    await expect(studentPage.getByPlaceholder(/meet\.google\.com/)).toHaveValue(meetingUrl);

    const outsider = await actor(browser, "teacher-secondary");
    const outsiderPage = await outsider.newPage();
    await outsiderPage.goto(`/tuitions/${fixtures.tuitions.accepted.id}`);
    await expect(outsiderPage.getByText(meetingUrl)).toHaveCount(0);
    await expect(outsiderPage.getByRole("link", { name: /Join Class/ })).toHaveCount(0);

    await teacher.close();
    await student.close();
    await outsider.close();
  });

  test("accepted student submits a verified teacher review", async ({ browser }) => {
    const context = await actor(browser, "student");
    const page = await context.newPage();
    await page.goto(`/teachers/${fixtures.accounts.teacherPrimary.id}#ratings`);
    await page.getByRole("radio", { name: /৫ স্টার/ }).check();
    await page.locator("#teacher-review").fill("E2E verified tuition review");
    await page.getByRole("button", { name: "রেটিং প্রকাশ করুন" }).click();
    await expect(page.getByText("ধন্যবাদ! আপনার রেটিং প্রকাশিত হয়েছে।")).toBeVisible();
    const { data: review } = await service.from("reviews")
      .select("rating,verified,status")
      .eq("reviewer_id", fixtures.accounts.student.id)
      .eq("teacher_id", fixtures.accounts.teacherPrimary.id)
      .single();
    expect(review).toMatchObject({ rating: 5, verified: true, status: "published" });
    await context.close();
  });

  test("student can report and block a teacher", async ({ browser }) => {
    const context = await actor(browser, "student");
    const page = await context.newPage();
    await page.goto(`/teachers/${fixtures.accounts.teacherSecondary.id}`);
    await page.getByRole("button", { name: "ব্লক" }).click();
    await expect(page.getByText("ব্যবহারকারীকে ব্লক করা হয়েছে")).toBeVisible();
    await expect(page.getByRole("button", { name: "আনব্লক" })).toBeVisible();

    await page.getByRole("button", { name: "রিপোর্ট" }).click();
    const dialog = page.getByRole("dialog", { name: "রিপোর্ট করুন" });
    await dialog.locator("select").selectOption("scam");
    await dialog.locator("textarea").fill("E2E report fixture");
    await dialog.getByRole("button", { name: "জমা দিন" }).click();
    await expect(dialog.getByText("ধন্যবাদ — রিপোর্ট জমা হয়েছে।")).toBeVisible();
    await context.close();
  });

  test("admin moderates a report and a test account", async ({ browser }) => {
    const context = await actor(browser, "admin");
    const page = await context.newPage();

    await page.goto("/admin/reports");
    const report = page.locator("div.divide-y > div").filter({ hasText: "E2E report fixture" }).first();
    await report.getByRole("button", { name: "তদন্ত শুরু" }).click();
    await expect(page.getByText("রিপোর্ট আপডেট হয়েছে")).toBeVisible();

    await page.goto("/admin/users");
    const guardianRow = page.locator("tr").filter({ hasText: "E2E Guardian" });
    await guardianRow.getByRole("button", { name: "স্থগিত" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "স্থগিত করুন" }).click();
    await expect(page.getByText("অ্যাকাউন্ট স্ট্যাটাস আপডেট হয়েছে")).toBeVisible();
    await page.reload();
    await page.locator("tr").filter({ hasText: "E2E Guardian" }).getByRole("button", { name: "চালু করুন" }).click();
    await expect(page.getByText("অ্যাকাউন্ট স্ট্যাটাস আপডেট হয়েছে")).toBeVisible();
    await context.close();
  });
});
