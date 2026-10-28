import {
  completeDylan,
  acceptShift,
  escapeShift,
} from "./sidequest-helpers.mjs";
import { test, expect } from "./hotel-fixture.mjs";

const close = (page) =>
  page.getByRole("button", { name: "Close window", exact: true }).click();
const action = (page, name) =>
  page.locator(`dialog [data-action="${name}"]`).click();
const record = (page, id) => page.locator(`[data-clue="${id}"]`).click();
async function navigate(page, route) {
  await page.locator(`nav [data-nav="${route}"]`).click();
  await expect(page.locator(`nav [data-nav="${route}"]`)).toHaveAttribute(
    "aria-current",
    "page",
  );
}
async function register(page, name = "Avery") {
  await navigate(page, "reservations");
  await page.getByLabel("Guest name", { exact: true }).fill(name);
  await page.locator("#agree-guidelines").check();
  await page.getByRole("button", { name: "Collect my room key" }).click();
  await expect(
    page.getByRole("heading", { name: `Welcome back, ${name}.` }),
  ).toBeVisible();
}
async function unlock(page) {
  await page.locator("#journal-button").click();
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("Four-digit door code").fill("0404");
  await page.getByRole("button", { name: "Turn the lock" }).click();
  await expect(
    page.getByRole("heading", { name: "A choice of departures" }),
  ).toBeVisible();
}

test("full two-chapter investigation, five departure records, persistence and reset", async ({
  page,
}) => {
  test.setTimeout(120_000);
  page.setDefaultTimeout(30_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await register(page);
  await page.locator('main [data-action="explore"]').click();
  await page.locator('dialog [data-room="307"]').click();
  await action(page, "diary");
  await record(page, "clock");
  await expect(page.locator('[data-clue="clock"]')).toBeDisabled();
  await close(page);

  await page.locator('main [data-action="explore"]').click();
  await action(page, "monitor");
  await page.locator('[data-camera="2"]').click();
  await expect(page.locator(".camera-note")).toContainText("404");
  await record(page, "door");
  await page.locator('[data-camera="3"]').click();
  await expect(page.locator(".camera-note")).toContainText("CIRCUIT");
  await close(page);

  await navigate(page, "guestbook");
  await record(page, "ribbon");
  await navigate(page, "history");
  await page.locator('[data-action="ledger"]').click();
  await expect(page.locator(".ledger-table")).toContainText("Eleanor Vale");
  await record(page, "register");
  await page.locator('dialog [data-page="employees"]').click();
  await expect(
    page.getByRole("heading", { name: "Employee access", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Staff access code").fill("1987");
  await page.getByRole("button", { name: "Open staff records" }).click();
  await expect(page.locator("#employee-error")).toContainText(
    "Opening day, month first",
  );
  await page.getByLabel("Staff access code").fill("1003");
  await page.getByRole("button", { name: "Open staff records" }).click();
  await page.locator('[data-action="maintenance"]').click();
  await record(page, "switch");
  await close(page);
  await page.locator('[data-action="letter"]').click();
  await record(page, "letter");
  await expect(page.locator("#clue-count")).toHaveText("6 / 6");
  await close(page);
  await page.reload();
  await expect(page.locator("#clue-count")).toHaveText("6 / 6");
  await expect(
    page.getByRole("heading", { name: "The night desk archive" }),
  ).toBeVisible();

  await page.locator("#journal-button").click();
  await page.locator('dialog [data-room="404"]').click();
  await page.getByLabel("Four-digit door code").fill("1234");
  await page.getByRole("button", { name: "Turn the lock" }).click();
  await expect(page.locator("#unlock-error")).toContainText(
    "lock does not move",
  );
  await page.getByLabel("Four-digit door code").fill("0404");
  await page.getByRole("button", { name: "Turn the lock" }).click();
  await action(page, "ending-release");
  await expect(
    page.getByRole("heading", { name: "CHECKOUT REJECTED" }),
  ).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/breached/);
  await expect(page.locator("#clue-count")).toHaveText("6 / 12");
  await action(page, "continue-below");
  await expect(page.locator(".lower-register")).toBeVisible();
  await expect(page.locator('[data-action="puzzle-radio"]')).toBeDisabled();
  await unlock(page);
  await action(page, "ending-departure");
  await completeDylan(page);
  await expect(
    page.getByRole("heading", { name: "The unanswered message", exact: true }),
  ).toBeVisible();
  await close(page);
  await unlock(page);
  await action(page, "ending-return");
  await acceptShift(page);
  await escapeShift(page);
  const savedEndings = await page.evaluate(
    () => JSON.parse(localStorage.getItem("stillwater-hotel:v2")).endings,
  );
  expect(savedEndings).toEqual(
    expect.arrayContaining(["departure", "return", "release"]),
  );
  await page.reload();
  await page.locator("#journal-button").click();
  await expect(page.locator("dialog")).toContainText("The last checkout");
  await close(page);
  await page.locator("#chapter-return button").click();
  await solveLowerChapter(page);
  await expect(page.locator("#afterword-screen")).toBeVisible();
  await page.locator("[data-afterword-close]").click();
  await expect(
    page.getByRole("heading", { name: "Outside, it is morning." }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/breached/);
  await expect(page.locator("#clue-count")).toHaveText("12 / 12");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Outside, it is morning." }),
  ).toBeVisible();
  await page.locator('footer [data-action="about"]').click();
  await action(page, "reset-prompt");
  await action(page, "reset-confirm");
  await expect(page.locator("#clue-count")).toHaveText("0 / 6");
  const clearedSideStories = await page.evaluate(
    () => JSON.parse(localStorage.getItem("stillwater-hotel:v2")).sideQuests,
  );
  expect(clearedSideStories.dylan.notes).toEqual([]);
  expect(clearedSideStories.job.reviewed).toEqual([]);
  expect(clearedSideStories.job.stage).toBe("none");
  await expect(page.locator("#surveillance-return")).toBeHidden();
  await expect(page).toHaveURL(/#home$/);
  expect(errors).toEqual([]);
});

test("early third ending is locked; bedside card records the clock only once", async ({
  page,
}) => {
  await page.goto("/#rooms");
  await page.locator('[data-action="rules"]').click();
  await record(page, "clock");
  await expect(page.locator('[data-clue="clock"]')).toBeDisabled();
  await close(page);
  await expect(page.locator("#clue-count")).toHaveText("1 / 6");
  await unlock(page);
  await expect(
    page.locator('dialog [data-action="ending-release"]'),
  ).toBeDisabled();
  await action(page, "ending-departure");
  await expect(
    page.getByRole("heading", { name: "Dylan Harker’s message" }),
  ).toBeVisible();
});

test("room selection, registration validation, editable preferences, unregistered room and lookup", async ({
  page,
}) => {
  await page.goto("/#rooms");
  await page.locator('[data-action="explore"]').click();
  await page.locator('dialog [data-room="307"]').click();
  await expect(
    page.getByRole("heading", { name: "A key is waiting for you" }),
  ).toBeVisible();
  await close(page);
  await page.locator('[data-roomtype="residence"]').click();
  await page.locator('[data-book="residence"]').click();
  await expect(page.locator("#room-preference")).toHaveValue("residence");
  await page.getByLabel("Guest name", { exact: true }).fill("   ");
  await page.locator("#agree-guidelines").check();
  await page.getByRole("button", { name: "Collect my room key" }).click();
  await expect(page.locator("#reservation-error")).toContainText(
    "Please leave a name",
  );
  await page.getByLabel("Guest name", { exact: true }).fill("<img src=x>");
  await page.getByRole("button", { name: "Collect my room key" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome back, <img src=x>." }),
  ).toBeVisible();
  expect(await page.locator('main img[src="x"]').count()).toBe(0);
  await page.locator('[data-action="edit-reservation"]').click();
  await page.getByLabel("Length of stay").selectOption("3");
  await page.locator("#agree-guidelines").check();
  await page.getByRole("button", { name: "Collect my room key" }).click();
  await expect(page.locator(".details-list").first()).toContainText("3 nights");
  await page.locator('[data-action="lookup"]').click();
  await page.getByLabel("Room number", { exact: true }).fill("999");
  await page
    .getByRole("button", { name: "Find my room", exact: false })
    .last()
    .click();
  await expect(page.locator("#lookup-error")).toContainText(
    "not in our records",
  );
  await page.getByLabel("Room number", { exact: true }).fill("307");
  await page
    .getByRole("button", { name: "Find my room", exact: false })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "Room 307 — your room" }),
  ).toBeVisible();
});

test("guestbook notes are local, escaped, retained after reload and limited to five", async ({
  page,
}) => {
  await page.goto("/#guestbook");
  await page.getByLabel("Your name or initials").fill("   ");
  await page.getByLabel("Your message", { exact: true }).fill("   ");
  await page.getByRole("button", { name: "Leave a note" }).click();
  await expect(page.locator("#guestbook-error")).toContainText(
    "both a name and a message",
  );
  for (let n = 0; n < 6; n++) {
    await page.getByLabel("Your name or initials").fill("Guest <img src=x>");
    await page
      .getByLabel("Your message", { exact: true })
      .fill(`Memory ${n}: <script>bad()</script>`);
    await expect(page.locator("#message-count")).not.toHaveText("0");
    await page.getByRole("button", { name: "Leave a note" }).click();
  }
  await expect(page.locator(".local-guest-entry")).toHaveCount(5);
  await expect(page.locator(".local-guest-entry").first()).toContainText(
    "Memory 1",
  );
  await expect(page.locator(".local-guest-entry").last()).toContainText(
    "<script>bad()</script>",
  );
  expect(
    await page
      .locator(".local-guest-entry script, .local-guest-entry img")
      .count(),
  ).toBe(0);
  await page.reload();
  await expect(page.locator(".local-guest-entry")).toHaveCount(5);
});

test("keyboard document dismissal, optional sound, navigation history and staff logout", async ({
  page,
}) => {
  await page.goto("/");
  await page.locator('footer [data-action="about"]').click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.locator("#sound-button").click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.locator("#sound-button").click();
  await expect(page.locator("#sound-button")).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog")).not.toBeVisible();
  await expect(page.locator('[data-action="about"]')).toBeFocused();
  await navigate(page, "history");
  await navigate(page, "rooms");
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Some places stay with you." }),
  ).toBeVisible();
  await page.locator('a[href="#employees"]').click();
  await page.getByLabel("Staff access code").fill("1003");
  await page.getByLabel("Staff access code").press("Enter");
  await page.locator('[data-action="staff-logout"]').click();
  await expect(
    page.getByRole("heading", { name: "Night desk sign-in" }),
  ).toBeVisible();
});

for (const width of [320, 390, 768, 1320, 1440]) {
  test(`English content, functional navigation and no overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    const navWidths = await page
      .locator("nav > div")
      .evaluate((el) => ({ content: el.scrollWidth, visible: el.clientWidth }));
    expect(navWidths.content).toBeLessThanOrEqual(navWidths.visible + 1);
    for (const route of [
      "home",
      "rooms",
      "history",
      "guestbook",
      "reservations",
      "guide",
    ]) {
      await navigate(page, route);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      expect(await page.locator("main").innerText()).not.toMatch(
        /[\u3400-\u9fff]/,
      );
      const broken = await page
        .locator("main img")
        .evaluateAll(async (images) => {
          await Promise.all(
            images.map((img) =>
              img.complete
                ? Promise.resolve()
                : new Promise((resolve) => {
                    img.onload = resolve;
                    img.onerror = resolve;
                  }),
            ),
          );
          return images
            .filter((img) => !img.naturalWidth)
            .map((img) => img.src);
        });
      expect(broken).toEqual([]);
    }
    await page.locator('a[href="#employees"]').click();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await page.locator("#journal-button").click();
    const rect = await page.locator("dialog").boundingBox();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(width);
    await close(page);
    await expect(page.locator("#journal-button")).toBeFocused();
  });
}

test("corrupt storage does not block play", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("stillwater-hotel:v2", "{invalid"),
  );
  await page.reload();
  await expect(page.locator("#clue-count")).toHaveText("0 / 6");
  await register(page);
});

test("unavailable storage retains session play", async ({ page }) => {
  test.setTimeout(60_000);
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage blocked");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage blocked");
    };
  });
  await page.goto("/");
  // With storage blocked, the new opening still works entirely in memory.
  for (const id of ["harbor", "park", "cedar", "lake", "union", "elm"]) {
    await page.locator(`[data-job-card="${id}"] [data-career-apply]`).click();
    await expect(
      page.locator(`[data-job-card="${id}"] .career-result`),
    ).toBeVisible();
  }
  await page.locator('[data-career="enter"]').click();
  await register(page);
  await page.locator('main [data-action="rules"]').click();
  await record(page, "clock");
  await expect(page.locator("#clue-count")).toHaveText("1 / 6");
});

test("previous edition progress migrates without losing recovered clues", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("stillwater-hotel:v2");
    localStorage.setItem(
      "no-return-hotel:v1",
      JSON.stringify({
        name: "Returning guest",
        checkedIn: true,
        clues: ["clock", "tape", "name"],
        ending: "exit",
      }),
    );
  });
  await page.reload();
  await expect(page.locator("#clue-count")).toHaveText("3 / 6");
  await navigate(page, "reservations");
  await expect(
    page.getByRole("heading", { name: "Welcome back, Returning guest." }),
  ).toBeVisible();
  await page.locator("#journal-button").click();
  await expect(page.locator("dialog")).toContainText("The unanswered message");
  await expect(page.locator("dialog")).toContainText("A sixth door");
});

async function solveLowerChapter(page) {
  await page.locator('main [data-action="puzzle-power"]').click();
  for (const id of [1, 2, 3, 4])
    await page.locator(`[data-circuit="${id}"]`).click();
  await page
    .getByRole("button", { name: "Energize selected sequence" })
    .click();
  await expect(page.locator("#puzzle-error")).toContainText(
    "rejects the sequence",
  );
  await action(page, "clear-circuits");
  for (const id of [3, 1, 4, 2])
    await page.locator(`[data-circuit="${id}"]`).click();
  await page
    .getByRole("button", { name: "Energize selected sequence" })
    .click();
  await expect(
    page.getByRole("heading", { name: "The second supply answers" }),
  ).toBeVisible();
  await action(page, "puzzle-radio");
  await page
    .getByRole("button", { name: "Lock carrier & decode transcript" })
    .click();
  await expect(page.locator("#puzzle-error")).toContainText("Only static");
  await page.locator("#radio-frequency").evaluate((input) => {
    input.value = "887";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect(page.locator("#frequency-output")).toHaveText("88.7 MHz");
  await page
    .getByRole("button", { name: "Lock carrier & decode transcript" })
    .click();
  await expect(page.locator("dialog")).toContainText("FIRST LETTER");
  await action(page, "puzzle-archive");
  await page.getByLabel("Five-letter cabinet word").fill("WRONG");
  await page.getByRole("button", { name: "Open the census box" }).click();
  await expect(page.locator("#puzzle-error")).toContainText("FIRST LETTER");
  await page.getByLabel("Five-letter cabinet word").fill("still");
  await page.getByRole("button", { name: "Open the census box" }).click();
  await action(page, "puzzle-identity");
  await page
    .getByLabel("Full name of the original occupant of Room 311")
    .fill("The relief porter");
  await page.getByRole("button", { name: "Restore the missing name" }).click();
  await expect(page.locator("#puzzle-error")).toContainText("another entry");
  await page
    .getByLabel("Full name of the original occupant of Room 311")
    .fill("walter vale");
  await page.getByRole("button", { name: "Restore the missing name" }).click();
  await action(page, "puzzle-mirror");
  await expect(page.locator(".mirror-record")).toContainText(
    "YEK EHT NRUT TON OD",
  );
  await page.getByLabel("Decoded instruction").fill("Do not turn the key.");
  await page.getByRole("button", { name: "Record the instruction" }).click();
  await action(page, "puzzle-chronology");
  for (const id of ["return", "stop", "open"])
    await page.locator(`[data-date="${id}"]`).click();
  await page
    .getByRole("button", { name: "Commit the corrected sequence" })
    .click();
  await expect(page.locator("#puzzle-error")).toContainText(
    "arrival must precede",
  );
  await action(page, "clear-dates");
  for (const id of ["open", "stop", "return"])
    await page.locator(`[data-date="${id}"]`).click();
  await page
    .getByRole("button", { name: "Commit the corrected sequence" })
    .click();
  await expect(page.locator("#clue-count")).toHaveText("12 / 12");
  await close(page);
  await page.reload();
  await expect(page.locator(".lower-card.verified")).toHaveCount(6);
  await page.locator('main [data-action="final-discharge"]').click();
  await page
    .getByLabel("Which register will you present?")
    .selectOption("copy");
  await page
    .getByLabel("What will you do with the brass key?")
    .selectOption("turn");
  await page
    .getByLabel("Which departure will you record?")
    .selectOption("white");
  await page.locator('#lower-discharge-form button[type="submit"]').click();
  await expect(page.locator("#puzzle-error")).toContainText(
    "keep the circuit closed",
  );
  await action(page, "accept-uniform");
  await expect(
    page.getByRole("heading", { name: "The new night porter" }),
  ).toBeVisible();
  await action(page, "final-discharge");
  await page
    .getByLabel("Which register will you present?")
    .selectOption("original");
  await page
    .getByLabel("What will you do with the brass key?")
    .selectOption("leave");
  await page
    .getByLabel("Which departure will you record?")
    .selectOption("stair");
  await page.locator('#lower-discharge-form button[type="submit"]').click();
}
