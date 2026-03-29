interface AdditionalChargeEmailData {
  clientName: string
  amount: number
  reason: string
  bookingDate: string
  eventType: string
}

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateDisplay(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function buildAdditionalChargeEmailHtml(data: AdditionalChargeEmailData): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.americanroyaltylasvegas.com'

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
              <img src="${siteUrl}/images/logo.png" alt="American Royalty" width="180" height="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
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
                An additional charge has been applied to your booking. Here are the details:
              </p>
            </td>
          </tr>

          <!-- Charge Details Card -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:0;">
                    <div style="height:3px;background:linear-gradient(to right,#D6C08A,#6F2DBD);border-radius:12px 12px 0 0;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;width:120px;">Booking</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.eventType} &mdash; ${formatDateDisplay(data.bookingDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Reason</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.reason}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Amount Charged</td>
                        <td style="padding:12px 0 0;font-size:20px;color:#D6C08A;text-align:right;font-weight:700;">${fmt(data.amount)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                If you have any questions about this charge, please call us at <strong style="color:#D6C08A;">(702) 666-4037</strong> or reply to this email.
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
