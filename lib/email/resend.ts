import { Resend } from "resend"

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    return null
  }

  return new Resend(apiKey)
}

export function getEmailSenderConfig() {
  const from = process.env.RESEND_FROM_EMAIL

  if (!from) {
    throw new Error("RESEND_FROM_EMAIL is not configured.")
  }

  return {
    from,
    replyTo: process.env.RESEND_REPLY_TO_EMAIL || undefined,
  }
}
