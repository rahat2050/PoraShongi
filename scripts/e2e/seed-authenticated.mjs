import fs from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const PRODUCTION_REF = "jilepfgytmrkxgascvvp";
const TEST_DOMAIN = "e2e.porasathi.test";
const required = [
  "E2E_SUPABASE_URL",
  "E2E_SUPABASE_ANON_KEY",
  "E2E_SUPABASE_SERVICE_ROLE_KEY",
  "E2E_SUPABASE_PROJECT_REF",
  "E2E_TEST_PASSWORD",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing required environment variable: ${name}`);
}

const url = process.env.E2E_SUPABASE_URL;
const expectedRef = process.env.E2E_SUPABASE_PROJECT_REF;
const actualRef = new URL(url).hostname.split(".")[0];
if (actualRef !== expectedRef) throw new Error("E2E project URL does not match E2E_SUPABASE_PROJECT_REF.");
if (actualRef === PRODUCTION_REF) throw new Error("Refusing to seed the PoraSathi production Supabase project.");
if (process.env.E2E_ALLOW_RESET !== "true") throw new Error("Set E2E_ALLOW_RESET=true only for the isolated test project.");

const admin = createClient(url, process.env.E2E_SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const password = process.env.E2E_TEST_PASSWORD;
const accountSpecs = [
  ["student", `student@${TEST_DOMAIN}`, "E2E Student", "student"],
  ["guardian", `guardian@${TEST_DOMAIN}`, "E2E Guardian", "guardian"],
  ["teacherPrimary", `teacher-primary@${TEST_DOMAIN}`, "E2E Teacher Primary", "teacher"],
  ["teacherSecondary", `teacher-secondary@${TEST_DOMAIN}`, "E2E Teacher Secondary", "teacher"],
  ["admin", `admin@${TEST_DOMAIN}`, "E2E Admin", "student"],
];

async function removeExistingUsers() {
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const matches = data.users.filter((user) => user.email?.endsWith(`@${TEST_DOMAIN}`));
    for (const user of matches) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;
    }
    if (data.users.length < 1000) break;
    page += 1;
  }
}

async function waitForProfile(id) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const { data } = await admin.from("profiles").select("id").eq("id", id).maybeSingle();
    if (data) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Profile trigger did not create profile for ${id}`);
}

async function createAccounts() {
  const accounts = {};
  for (const [key, email, fullName, role] of accountSpecs) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });
    if (error || !data.user) throw error ?? new Error(`Could not create ${key}`);
    await waitForProfile(data.user.id);
    accounts[key] = { id: data.user.id, email, fullName };
  }
  const { error: adminRoleError } = await admin.from("profiles").update({ role: "admin" }).eq("id", accounts.admin.id);
  if (adminRoleError) throw adminRoleError;
  return accounts;
}

async function updateBaseProfiles(accounts) {
  for (const [key, account] of Object.entries(accounts)) {
    const { error } = await admin.from("profiles").update({
      full_name: account.fullName,
      district: "Dhaka",
      area: "Dhanmondi",
      account_status: "active",
      verification_status: key.startsWith("teacher") ? "verified" : "unverified",
      guardian_consent: key === "student",
    }).eq("id", account.id);
    if (error) throw error;
  }
  for (const key of ["teacherPrimary", "teacherSecondary"]) {
    const { error } = await admin.from("teacher_profiles").update({
      headline: `${accounts[key].fullName} Mathematics Tutor`,
      education: "BSc in Mathematics",
      institution: "E2E University",
      subjects: ["Mathematics"],
      classes_taught: ["Class 8", "Class 9"],
      experience_years: 5,
      teaching_mode: "online",
      expected_salary: 5000,
      available_days: ["Friday", "Saturday"],
      available_time: "Evening",
      bio: "Automated test teacher profile.",
    }).eq("id", accounts[key].id);
    if (error) throw error;
  }
  const { error: studentError } = await admin.from("student_profiles").update({
    grade: "Class 8",
    institution: "E2E School",
    teaching_mode_preference: "online",
  }).eq("id", accounts.student.id);
  if (studentError) throw studentError;
  const { error: guardianError } = await admin.from("guardian_profiles").update({
    relationship_to_student: "parent",
    contact_preference: "message",
    linked_student_id: accounts.student.id,
  }).eq("id", accounts.guardian.id);
  if (guardianError) throw guardianError;
}

async function createTuition(accounts, key, title) {
  const { data, error } = await admin.from("tuitions").insert({
    poster_id: accounts.student.id,
    student_id: accounts.student.id,
    title,
    class_level: "Class 8",
    subject: "Mathematics",
    district: "Dhaka",
    area: "Dhanmondi",
    budget: 5000,
    teaching_mode: "online",
    preferred_days: ["Friday"],
    preferred_time: "Evening",
    requirements: `E2E fixture: ${key}`,
    status: "open",
  }).select("id,title").single();
  if (error) throw error;
  return data;
}

async function createRequest(accounts, tuitionId, teacherKey, message) {
  const { data, error } = await admin.from("tuition_requests").insert({
    tuition_id: tuitionId,
    sender_id: accounts.student.id,
    student_id: accounts.student.id,
    teacher_id: accounts[teacherKey].id,
    message,
    status: "pending",
  }).select("id,tuition_id,teacher_id,status").single();
  if (error) throw error;
  return data;
}

async function createFixtures(accounts) {
  const tuitions = {};
  for (const [key, title] of Object.entries({
    send: "E2E Send Request Tuition",
    withdraw: "E2E Withdraw Request Tuition",
    reject: "E2E Reject Request Tuition",
    exclusive: "E2E Acceptance Exclusivity Tuition",
    accepted: "E2E Accepted Match Tuition",
  })) tuitions[key] = await createTuition(accounts, key, title);

  const requests = {
    withdraw: await createRequest(accounts, tuitions.withdraw.id, "teacherPrimary", "Withdraw fixture"),
    reject: await createRequest(accounts, tuitions.reject.id, "teacherPrimary", "Reject fixture"),
    exclusivePrimary: await createRequest(accounts, tuitions.exclusive.id, "teacherPrimary", "Primary exclusivity fixture"),
    exclusiveSecondary: await createRequest(accounts, tuitions.exclusive.id, "teacherSecondary", "Secondary exclusivity fixture"),
    accepted: await createRequest(accounts, tuitions.accepted.id, "teacherPrimary", "Accepted fixture"),
  };
  const teacherClient = createClient(url, process.env.E2E_SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await teacherClient.auth.signInWithPassword({
    email: accounts.teacherPrimary.email,
    password,
  });
  if (signInError) throw signInError;
  const { data: acceptedRequest, error: acceptError } = await teacherClient.from("tuition_requests")
    .update({ status: "accepted" })
    .eq("id", requests.accepted.id)
    .select("id,status").single();
  if (acceptError) throw acceptError;
  requests.accepted = acceptedRequest;

  const { data: session, error: sessionError } = await admin.from("sessions").insert({
    tuition_id: tuitions.accepted.id,
    teacher_id: accounts.teacherPrimary.id,
    student_id: accounts.student.id,
    scheduled_at: new Date(Date.now() + 86_400_000).toISOString(),
    status: "scheduled",
    notes: "E2E seeded session",
  }).select("id").single();
  if (sessionError) throw sessionError;

  const participants = [accounts.student.id, accounts.teacherPrimary.id].sort();
  const { data: conversation, error: conversationError } = await admin.from("conversations").insert({
    tuition_id: tuitions.accepted.id,
    participant_a: participants[0],
    participant_b: participants[1],
  }).select("id").single();
  if (conversationError) throw conversationError;
  const { error: messageError } = await admin.from("messages").insert({
    conversation_id: conversation.id,
    sender_id: accounts.student.id,
    body: "E2E seeded message",
  });
  if (messageError) throw messageError;

  return { tuitions, requests, session, conversation };
}

await removeExistingUsers();
const accounts = await createAccounts();
await updateBaseProfiles(accounts);
const fixtures = await createFixtures(accounts);
const outputDir = path.resolve("tests/e2e-auth/.auth");
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, "fixtures.json"), JSON.stringify({ accounts, ...fixtures }, null, 2));
console.log(`Seeded isolated E2E project ${actualRef} with ${Object.keys(accounts).length} accounts.`);
