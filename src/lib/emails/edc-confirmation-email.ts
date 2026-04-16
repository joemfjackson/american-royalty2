interface EdcConfirmationData {
  clientName: string
  selectedNights: string[]
  guestCount: string
  siteUrl: string
}

export function buildEdcConfirmationEmailHtml(data: EdcConfirmationData): string {
  const nightsDisplay = data.selectedNights.join(', ')

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
                Thank you for your EDC 2026 transportation request! We've received your details and our team is checking availability now.
              </p>
            </td>
          </tr>

          <!-- Details box -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="16" cellspacing="0" style="background-color:#1A1A1A;border-radius:8px;border:1px solid #333333;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:14px;color:#D6C08A;font-weight:600;">Your Request</p>
                    <p style="margin:0 0 4px;font-size:14px;color:#cccccc;">Selected Nights: <strong style="color:#ffffff;">${nightsDisplay}</strong></p>
                    <p style="margin:0;font-size:14px;color:#cccccc;">Group Size: <strong style="color:#ffffff;">${data.guestCount} guests</strong></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Response time -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">
                Expect a response within <strong style="color:#ffffff;">2 hours</strong> with availability and pricing for your group.
              </p>
            </td>
          </tr>

          <!-- Contact info -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                Questions? Call or text <strong style="color:#D6C08A;">(702) 666-4037</strong>
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
