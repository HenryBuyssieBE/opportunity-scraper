import twilio from "twilio";
import type { Opportunity } from "../ai/types.js";

export async function sendAlert(opportunity: Opportunity): Promise<void> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM, TWILIO_WHATSAPP_TO } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !TWILIO_WHATSAPP_TO) {
    console.warn("Twilio not configured — skipping WhatsApp alert.");
    return;
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  await client.messages.create({
    from: `whatsapp:${TWILIO_WHATSAPP_FROM}`,
    to: `whatsapp:${TWILIO_WHATSAPP_TO}`,
    body: `New opportunity (${opportunity.score.overall}/10): ${opportunity.title}\n${opportunity.signal}\n${opportunity.source_url}`,
  });
}
