interface QuoteRequestConfirmationData {
  clientName: string
  eventType: string
  eventDate: string
  siteUrl: string
}

function formatDateDisplay(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

export function buildQuoteRequestConfirmationEmailHtml(data: QuoteRequestConfirmationData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0A0A0A;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Header with Logo -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <img src="${data.siteUrl}/images/logo.png" alt="American Royalty" width="180" height="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
            </td>
          </tr>

          <!-- Gold accent line -->
          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:2px;background:linear-gradient(to right,transparent,#D6C08A,transparent);"></div>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:16px;color:#ffffff;">Hi ${data.clientName},</p>
              <p style="margin:12px 0 0;font-size:15px;color:#cccccc;line-height:1.5;">
                Thank you for your quote request! We've received your details for your ${data.eventType.toLowerCase()} on ${formatDateDisplay(data.eventDate)}.
              </p>
              <p style="margin:12px 0 0;font-size:15px;color:#cccccc;line-height:1.5;">
                Our team is reviewing your request and will have your custom quote ready shortly. We'll send you another email with a link to view your quote and book online.
              </p>
            </td>
          </tr>

          <!-- Contact info -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                Questions in the meantime? Call us at <strong style="color:#D6C08A;">(702) 666-4037</strong>.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 0 24px;">
              <div style="height:1px;background-color:#1E1E1E;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding:0;">
              <p style="margin:0;font-size:13px;color:#D6C08A;font-weight:600;">The American Royalty Team</p>
              <p style="margin:4px 0 0;font-size:12px;color:#666;">
                americanroyaltylasvegas.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}
