import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend() {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'no-reply@svarai.no'
export const FROM_NAME = process.env.RESEND_FROM_NAME || 'SvarAI'

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: {
  to: string
  subject: string
  html: string
  replyTo?: string
}) {
  const resend = getResend()
  return resend.emails.send({
    from: `${FROM_NAME} <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    replyTo,
  })
}

export async function sendVerificationEmail(email: string, confirmUrl: string) {
  return sendEmail({
    to: email,
    subject: 'Bekreft e-postadressen din — SvarAI',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Velkommen til SvarAI!</h1>
        <p>Klikk på knappen nedenfor for å bekrefte e-postadressen din:</p>
        <a href="${confirmUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Bekreft e-post</a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Lenken er gyldig i 24 timer. Hvis du ikke opprettet denne kontoen, kan du ignorere denne e-posten.</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, orgName: string) {
  return sendEmail({
    to: email,
    subject: `Velkommen til SvarAI, ${orgName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a;">Velkommen til SvarAI!</h1>
        <p>Hei,</p>
        <p>Kontoen din for <strong>${orgName}</strong> er klar. Start ved å koble til e-postkontoen din og la AI-en ta seg av svarene.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Gå til dashboard</a>
        <p style="color: #666; font-size: 14px; margin-top: 24px;">Spørsmål? Kontakt oss på support@svarai.no</p>
      </div>
    `,
  })
}
