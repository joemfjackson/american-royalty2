interface PackageBookingEmailData {
  clientName: string
  packageName: string
  eventDate: string
  eventTime: string
  tierLabel: string
  pickupLocation: string
  price: number
}

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateDisplay(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

export function buildPackageBookingEmailHtml(data: PackageBookingEmailData): string {
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
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <img src="${siteUrl}/images/logo.png" alt="American Royalty" width="180" height="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 32px;">
              <div style="height:2px;background:linear-gradient(to right,transparent,#D6C08A,transparent);"></div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding:0 0 24px;">
              <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background-color:rgba(16,185,129,0.1);border:2px solid rgba(16,185,129,0.3);font-size:32px;color:#34D399;">&#10003;</div>
              <h1 style="margin:16px 0 0;font-size:24px;color:#ffffff;font-weight:700;">You're Booked!</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#cccccc;">
                Hi ${data.clientName}, your Las Vegas party bus experience is confirmed.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:0;">
                    <div style="height:3px;background:linear-gradient(to right,#10B981,#D6C08A,#10B981);border-radius:12px 12px 0 0;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Booking Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;width:120px;">Package</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.packageName}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Date</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${formatDateDisplay(data.eventDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Time</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.eventTime}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Party Size</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.tierLabel}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Pickup</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.pickupLocation}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Total Paid</td>
                        <td style="padding:12px 0 0;font-size:20px;color:#34D399;text-align:right;font-weight:700;">${fmt(data.price)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">What to Bring</p>
                    <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.6;">
                      Your drinks (we stop at a liquor store, or bring your own) &bull; Your crew &bull; Good vibes
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">What's Next</p>
                    <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.6;">
                      Your professional chauffeur will meet you at ${data.pickupLocation} on your event date. Make sure your group is ready — the party starts the moment you step on board.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                Need to make changes? Call <strong style="color:#D6C08A;">(702) 666-4037</strong> or reply to this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 0 24px;">
              <div style="height:1px;background-color:#1E1E1E;"></div>
            </td>
          </tr>
          <tr>
            <td style="text-align:center;padding:0;">
              <p style="margin:0;font-size:13px;color:#D6C08A;font-weight:600;">The American Royalty Team</p>
              <p style="margin:4px 0 0;font-size:12px;color:#666;">americanroyaltylasvegas.com</p>
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
