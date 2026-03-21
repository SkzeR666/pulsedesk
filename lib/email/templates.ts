function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function shell({ preview, title, eyebrow, body, ctaLabel, ctaHref, footer }: {
  preview: string
  title: string
  eyebrow: string
  body: string
  ctaLabel: string
  ctaHref: string
  footer: string
}) {
  return `
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#050505;color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#050505;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#0d0d0d;border:1px solid #242424;border-radius:20px;overflow:hidden;">
              <tr>
                <td style="padding:32px 32px 16px;">
                  <div style="display:inline-flex;align-items:center;gap:10px;padding:9px 12px;border-radius:999px;background:#121212;border:1px solid #242424;font-size:12px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:#d4d4d4;">
                    ${escapeHtml(eyebrow)}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 32px 32px;">
                  <h1 style="margin:0 0 16px;font-size:34px;line-height:1.05;color:#ffffff;font-weight:700;">${escapeHtml(title)}</h1>
                  <div style="margin:0 0 28px;font-size:16px;line-height:1.7;color:#b3b3b3;">${body}</div>
                  <a href="${ctaHref}" style="display:inline-block;padding:15px 22px;border-radius:12px;background:#ffffff;color:#050505;text-decoration:none;font-size:15px;font-weight:700;">${escapeHtml(ctaLabel)}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px;border-top:1px solid #242424;font-size:13px;line-height:1.7;color:#8a8a8a;">
                  ${footer}
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `
}

export function renderWorkspaceInviteEmail(input: {
  inviteeEmail: string
  inviterName: string
  workspaceName: string
  teamName: string
  roleLabel: string
  inviteLink: string
}) {
  const title = `Seu acesso ao ${input.workspaceName} esta pronto`
  const body = `
    <p style="margin:0 0 18px;">${escapeHtml(input.inviterName)} convidou voce para entrar no workspace <strong style="color:#ffffff;">${escapeHtml(input.workspaceName)}</strong>.</p>
    <div style="padding:18px 20px;border-radius:16px;background:#121212;border:1px solid #242424;margin:0 0 20px;">
      <div style="font-size:13px;color:#8a8a8a;margin-bottom:8px;">Convite para</div>
      <div style="font-size:18px;color:#ffffff;font-weight:600;margin-bottom:14px;">${escapeHtml(input.inviteeEmail)}</div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:#1a1a1a;color:#f5f5f5;font-size:13px;">Setor: ${escapeHtml(input.teamName)}</span>
        <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:#1a1a1a;color:#f5f5f5;font-size:13px;">Funcao: ${escapeHtml(input.roleLabel)}</span>
      </div>
    </div>
    <p style="margin:0;">Ao abrir o convite, voce cria ou acessa sua conta e entra direto no ambiente da empresa.</p>
  `

  return shell({
    preview: `Convite para entrar no workspace ${input.workspaceName}`,
    eyebrow: "PulseDesk Invite",
    title,
    body,
    ctaLabel: "Aceitar convite",
    ctaHref: input.inviteLink,
    footer: `
      Se o botao nao abrir, use este link:<br />
      <a href="${input.inviteLink}" style="color:#ffffff;text-decoration:none;">${escapeHtml(input.inviteLink)}</a>
    `,
  })
}

export function renderWorkspaceInviteText(input: {
  inviterName: string
  workspaceName: string
  teamName: string
  roleLabel: string
  inviteLink: string
}) {
  return [
    `${input.inviterName} convidou voce para entrar no workspace ${input.workspaceName}.`,
    `Time: ${input.teamName}`,
    `Funcao: ${input.roleLabel}`,
    "",
    `Abra este link para aceitar o convite: ${input.inviteLink}`,
  ].join("\n")
}
