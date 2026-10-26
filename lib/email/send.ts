import "server-only";

import { SESv2Client, SendEmailCommand, type MessageHeader } from "@aws-sdk/client-sesv2";
import type { Email } from "./layout";

// Sending goes through Amazon SES (eu-north-1, Luka's AWS account). littlebraincrew.com is a verified identity there
// with Easy DKIM and the MAIL FROM domain mail.littlebraincrew.com, so SPF, DKIM and DMARC all align with the From.
// Receiving stays on Hostinger (root MX), so replies to the From / Reply-To address land in a real mailbox.
// Keys belong to an IAM user that may only call ses:SendEmail (README: Email). Empty keys = nothing is sent,
// the call is only logged, so the funnel keeps working in preview.

const REGION = process.env.SES_REGION || "eu-north-1";
const ACCESS_KEY = process.env.SES_ACCESS_KEY_ID ?? "";
const SECRET_KEY = process.env.SES_SECRET_ACCESS_KEY ?? "";
const FROM = process.env.EMAIL_FROM || "Little Brain Crew <hello@littlebraincrew.com>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "";
const CONFIGURATION_SET = process.env.SES_CONFIGURATION_SET ?? "";

export const emailConfigured = Boolean(ACCESS_KEY && SECRET_KEY);

let client: SESv2Client | undefined;

type Options = {
  /** Only for mail people signed up for (newsletters, challenges), never receipts: adds one-click unsubscribe
   *  headers, which Gmail and Yahoo require from bulk senders. The URL must accept a POST and unsubscribe at once. */
  unsubscribeUrl?: string;
  /** Shows up in SES events (bounces, complaints) when a configuration set is used. */
  tag?: string;
};

/** Sends one email. Returns the SES message id, or null when email isn't configured (preview). */
export async function sendEmail(to: string, email: Email, { unsubscribeUrl, tag }: Options = {}): Promise<string | null> {
  if (!emailConfigured) {
    console.info("[email] not configured, not sent", { to, subject: email.subject });
    return null;
  }
  client ??= new SESv2Client({ region: REGION, credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY } });

  const headers: MessageHeader[] = [];
  if (unsubscribeUrl) {
    headers.push({ Name: "List-Unsubscribe", Value: `<${unsubscribeUrl}>` }, { Name: "List-Unsubscribe-Post", Value: "List-Unsubscribe=One-Click" });
  }

  const res = await client.send(
    new SendEmailCommand({
      FromEmailAddress: FROM,
      Destination: { ToAddresses: [to] },
      ReplyToAddresses: REPLY_TO ? [REPLY_TO] : undefined,
      ConfigurationSetName: CONFIGURATION_SET || undefined,
      EmailTags: tag ? [{ Name: "type", Value: tag }] : undefined,
      Content: {
        Simple: {
          Subject: { Data: email.subject, Charset: "UTF-8" },
          // Always both parts: an HTML-only message is a classic spam signal, and some readers prefer text.
          Body: { Html: { Data: email.html, Charset: "UTF-8" }, Text: { Data: email.text, Charset: "UTF-8" } },
          Headers: headers.length ? headers : undefined,
        },
      },
    }),
  );
  return res.MessageId ?? null;
}
