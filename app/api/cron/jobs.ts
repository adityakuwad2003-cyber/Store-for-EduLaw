import { adminDb } from "../_lib/adminInit";
import { verifyAdmin } from "../_lib/security";
import { Resend } from "resend";
import { timingSafeEqual } from "crypto";

/**
 * /api/cron/jobs
 * Unified cron dispatcher. Routes to the correct job via ?job=<name>.
 * Replaces /api/cron/daily-newsletter and /api/cron/monthly-digest.
 *
 * Security: requires Authorization: Bearer <CRON_SECRET> header OR a valid admin Firebase token.
 */

const BATCH_SIZE = 90;

// ── Helper functions (verbatim from original files) ──────────────────────────

function todayDateString(): string {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function yesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function buildNewsletterHtml(items: any[], dateStr: string): string {
  const formattedDate = new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  });

  const newsRows = items
    .slice(0, 8)
    .map(
      (item, i) => `
    <tr>
      <td style="padding:16px 0; border-bottom:1px solid #f0ece4;">
        <p style="margin:0 0 4px; font-size:11px; color:#9c7b4a; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
          ${item.court || item.category || "Legal Update"}
        </p>
        <p style="margin:0 0 6px; font-size:16px; font-weight:700; color:#1a1209; line-height:1.4;">
          ${i + 1}. ${item.title}
        </p>
        <p style="margin:0 0 8px; font-size:14px; color:#6b5d4f; line-height:1.6;">
          ${item.summary || ""}
        </p>
        ${item.url ? `<a href="${item.url}" style="font-size:12px; color:#6B1E2E; font-weight:700; text-decoration:none;">Read full judgment →</a>` : ""}
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduLaw Daily Legal Update</title></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1209;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Daily Legal Update</p>
            <h1 style="margin:0;font-size:26px;color:#f7f3ec;font-weight:700;">EduLaw Newsletter</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#c9a84c;">${formattedDate}</p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0;font-size:15px;color:#3d2b1f;line-height:1.7;">
              Here's your curated daily roundup of the most important Supreme Court &amp; High Court developments — hand-picked for EduLaw Pro &amp; Max subscribers.
            </p>
          </td>
        </tr>

        <!-- News Items -->
        <tr>
          <td style="padding:8px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${newsRows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 28px;" align="center">
            <a href="https://store.theedulaw.in/legal-hub" style="display:inline-block;background:#6B1E2E;color:#f7f3ec;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;">
              Read All Legal Updates →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f3ec;padding:20px 32px;border-top:1px solid #e8e0d4;">
            <p style="margin:0;font-size:12px;color:#9c7b4a;text-align:center;line-height:1.6;">
              You're receiving this as an EduLaw Pro/Max subscriber.<br>
              © The EduLaw, Pune, Maharashtra<br>
              <a href="https://store.theedulaw.in/subscription" style="color:#6B1E2E;">Manage subscription</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildDigestHtml(items: any[], monthLabel: string): string {
  const digestRows = items
    .slice(0, 10)
    .map(
      (item, i) => `
    <tr>
      <td style="padding:20px 0; border-bottom:1px solid #f0ece4;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="width:36px; vertical-align:top; padding-top:2px;">
              <div style="width:28px;height:28px;background:#c9a84c;border-radius:50%;text-align:center;line-height:28px;font-size:13px;font-weight:700;color:#1a1209;">${i + 1}</div>
            </td>
            <td style="padding-left:12px;">
              <p style="margin:0 0 4px; font-size:11px; color:#9c7b4a; font-weight:700; text-transform:uppercase; letter-spacing:0.05em;">
                ${item.court || item.category || "Supreme Court"}
              </p>
              <p style="margin:0 0 8px; font-size:16px; font-weight:700; color:#1a1209; line-height:1.4;">
                ${item.title}
              </p>
              <p style="margin:0 0 8px; font-size:14px; color:#6b5d4f; line-height:1.7;">
                ${item.summary || item.description || ""}
              </p>
              ${item.url ? `<a href="${item.url}" style="font-size:12px; color:#c9a84c; font-weight:700; text-decoration:none;">Read judgment →</a>` : ""}
            </td>
          </tr>
        </table>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>EduLaw Monthly Judgment Digest</title></head>
<body style="margin:0;padding:0;background:#f7f3ec;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f3ec;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#1a1209;padding:28px 32px;">
            <p style="margin:0 0 4px;font-size:11px;color:#c9a84c;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Monthly Judgment Digest</p>
            <h1 style="margin:0;font-size:26px;color:#f7f3ec;font-weight:700;">EduLaw Digest</h1>
            <p style="margin:6px 0 0;font-size:13px;color:#c9a84c;">${monthLabel}</p>
          </td>
        </tr>

        <!-- Gold accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#c9a84c,#e8c96d);"></td></tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 32px 8px;">
            <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1209;">Top 10 Judgments This Month</p>
            <p style="margin:0;font-size:14px;color:#3d2b1f;line-height:1.7;">
              Your curated monthly roundup of the most consequential Supreme Court &amp; High Court rulings — selected for their impact on legal practice, civil rights, and competitive law exams.
            </p>
          </td>
        </tr>

        <!-- Digest Items -->
        <tr>
          <td style="padding:8px 32px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${digestRows}
            </table>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;" align="center">
            <a href="https://store.theedulaw.in/legal-playground/digest" style="display:inline-block;background:#c9a84c;color:#1a1209;text-decoration:none;padding:14px 28px;border-radius:10px;font-size:14px;font-weight:700;margin-bottom:12px;">
              Browse Full Digest Library →
            </a>
            <br>
            <a href="https://store.theedulaw.in/judgement-finder" style="display:inline-block;margin-top:10px;font-size:13px;color:#6B1E2E;font-weight:700;text-decoration:none;">
              Use Judgment Finder (Pro/Max) →
            </a>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f3ec;padding:20px 32px;border-top:1px solid #e8e0d4;">
            <p style="margin:0;font-size:12px;color:#9c7b4a;text-align:center;line-height:1.6;">
              You're receiving this as an EduLaw Pro/Max subscriber.<br>
              © The EduLaw, Pune, Maharashtra<br>
              <a href="https://store.theedulaw.in/subscription" style="color:#6B1E2E;">Manage subscription</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Job sub-handlers ─────────────────────────────────────────────────────────

async function runDailyNewsletter(req: any, res: any) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.VITE_SENDER_EMAIL || "updates@theedulaw.in";

  try {
    // 1. Fetch today's legal news (fallback to yesterday)
    const today = todayDateString();
    let newsSnap = await adminDb
      .collection("playground_content")
      .where("contentType", "==", "daily_news")
      .where("dateString", "==", today)
      .limit(10)
      .get();

    if (newsSnap.empty) {
      const yesterday = yesterdayDateString();
      newsSnap = await adminDb
        .collection("playground_content")
        .where("contentType", "==", "daily_news")
        .where("dateString", "==", yesterday)
        .limit(10)
        .get();
    }

    if (newsSnap.empty) {
      await adminDb.collection("cron_logs").add({
        type: "daily_newsletter",
        sentAt: new Date(),
        status: "skipped",
        reason: "No news items found",
      });
      return res.status(200).json({ success: true, skipped: true, reason: "No news items found" });
    }

    const newsItems = newsSnap.docs.map(d => d.data());

    // 2. Fetch all active subscribers
    const usersSnap = await adminDb
      .collection("users")
      .where("subscription.status", "==", "active")
      .get();

    const emails: string[] = [];
    usersSnap.docs.forEach(doc => {
      const email = doc.data()?.email;
      if (email && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emails.push(email);
      }
    });

    if (emails.length === 0) {
      await adminDb.collection("cron_logs").add({
        type: "daily_newsletter",
        sentAt: new Date(),
        status: "skipped",
        reason: "No active subscribers",
      });
      return res.status(200).json({ success: true, skipped: true, reason: "No active subscribers" });
    }

    // 3. Build HTML
    const html = buildNewsletterHtml(newsItems, today);
    const subject = `📋 EduLaw Daily Legal Update — ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;

    // 4. Send in batches via Resend
    let sentCount = 0;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({
          from: `The EduLaw <${senderEmail}>`,
          to: [email],
          subject,
          html,
        }));
        await resend.batch.send(batch);
        sentCount += batch.length;
      }
    } else {
      // Dry-run mode when RESEND_API_KEY is not set
      sentCount = emails.length;
      console.log(`[dry-run] Would have sent daily newsletter to ${sentCount} subscribers`);
    }

    // 5. Log result
    await adminDb.collection("cron_logs").add({
      type: "daily_newsletter",
      sentAt: new Date(),
      recipientCount: sentCount,
      status: "sent",
      dateString: today,
    });

    return res.status(200).json({ success: true, sentCount });
  } catch (err) {
    console.error("daily-newsletter cron error:", err);
    await adminDb.collection("cron_logs").add({
      type: "daily_newsletter",
      sentAt: new Date(),
      status: "error",
      error: String(err),
    }).catch(() => {});
    return res.status(500).json({ error: "Newsletter send failed." });
  }
}

async function runMonthlyDigest(req: any, res: any) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.VITE_SENDER_EMAIL || "updates@theedulaw.in";

  try {
    // 1. Fetch last 30 days of digest content
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const digestSnap = await adminDb
      .collection("playground_content")
      .where("contentType", "==", "digest")
      .orderBy("publishedAt", "desc")
      .limit(10)
      .get();

    // Fallback: try daily_news if no dedicated digest content
    let items: any[] = digestSnap.docs.map(d => d.data());
    if (items.length < 3) {
      const fallbackSnap = await adminDb
        .collection("playground_content")
        .where("contentType", "==", "daily_news")
        .orderBy("publishedAt", "desc")
        .limit(10)
        .get();
      items = fallbackSnap.docs.map(d => d.data());
    }

    if (items.length === 0) {
      await adminDb.collection("cron_logs").add({
        type: "monthly_digest",
        sentAt: new Date(),
        status: "skipped",
        reason: "No digest items found",
      });
      return res.status(200).json({ success: true, skipped: true, reason: "No digest items" });
    }

    // 2. Fetch active subscribers
    const usersSnap = await adminDb
      .collection("users")
      .where("subscription.status", "==", "active")
      .get();

    const emails: string[] = [];
    usersSnap.docs.forEach(doc => {
      const email = doc.data()?.email;
      if (email && typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emails.push(email);
      }
    });

    if (emails.length === 0) {
      await adminDb.collection("cron_logs").add({
        type: "monthly_digest",
        sentAt: new Date(),
        status: "skipped",
        reason: "No active subscribers",
      });
      return res.status(200).json({ success: true, skipped: true, reason: "No active subscribers" });
    }

    // 3. Build email
    const monthLabel = new Date().toLocaleDateString("en-IN", {
      month: "long", year: "numeric",
    });
    const html = buildDigestHtml(items, monthLabel);
    const subject = `⚖️ EduLaw Monthly Judgment Digest — ${monthLabel}`;

    // 4. Send in batches
    let sentCount = 0;
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE).map(email => ({
          from: `The EduLaw <${senderEmail}>`,
          to: [email],
          subject,
          html,
        }));
        await resend.batch.send(batch);
        sentCount += batch.length;
      }
    } else {
      sentCount = emails.length;
      console.log(`[dry-run] Would have sent monthly digest to ${sentCount} subscribers`);
    }

    // 5. Log
    await adminDb.collection("cron_logs").add({
      type: "monthly_digest",
      sentAt: new Date(),
      recipientCount: sentCount,
      status: "sent",
      monthLabel,
    });

    return res.status(200).json({ success: true, sentCount });
  } catch (err) {
    console.error("monthly-digest cron error:", err);
    await adminDb.collection("cron_logs").add({
      type: "monthly_digest",
      sentAt: new Date(),
      status: "error",
      error: String(err),
    }).catch(() => {});
    return res.status(500).json({ error: "Digest send failed." });
  }
}

// ── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: any, res: any) {
  // Auth check: CRON_SECRET (Vercel scheduler) or valid admin Firebase token
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.authorization || "";
  const provided = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  const isCron = !!(cronSecret && provided.length === cronSecret.length &&
    timingSafeEqual(Buffer.from(provided), Buffer.from(cronSecret)));
  if (!isCron) {
    try { await verifyAdmin(req); } catch { return res.status(401).json({ error: "Unauthorized." }); }
  }
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const job = (req.query.job as string) || "";
  if (job === "daily-newsletter") return runDailyNewsletter(req, res);
  if (job === "monthly-digest") return runMonthlyDigest(req, res);
  return res.status(400).json({ error: "Unknown job. Use ?job=daily-newsletter or ?job=monthly-digest" });
}
