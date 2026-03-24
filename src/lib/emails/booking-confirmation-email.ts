interface BookingConfirmationEmailData {
  clientName: string
  eventType: string
  eventDate: string
  pickupTime: string | null
  durationHours: number | null
  vehicleName: string | null
  guestCount: number | null
  pickupLocation: string | null
  dropoffLocation: string | null
  totalAmount: number
  depositAmount: number
  balanceDue: number
  siteUrl: string
}

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDateDisplay(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

export function buildBookingConfirmationEmailHtml(data: BookingConfirmationEmailData): string {
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

          <!-- Success icon + heading -->
          <tr>
            <td style="text-align:center;padding:0 0 24px;">
              <div style="display:inline-block;width:64px;height:64px;line-height:64px;border-radius:50%;background-color:rgba(16,185,129,0.1);border:2px solid rgba(16,185,129,0.3);font-size:32px;color:#34D399;">&#10003;</div>
              <h1 style="margin:16px 0 0;font-size:24px;color:#ffffff;font-weight:700;">You're Booked!</h1>
              <p style="margin:8px 0 0;font-size:15px;color:#cccccc;">
                Hi ${data.clientName}, your reservation is confirmed.
              </p>
              <p style="margin:4px 0 0;font-size:15px;color:#cccccc;">
                Your deposit of <strong style="color:#D6C08A;">${fmt(data.depositAmount)}</strong> has been received.
              </p>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <!-- Emerald/gold top accent -->
                <tr>
                  <td style="padding:0;">
                    <div style="height:3px;background:linear-gradient(to right,#10B981,#D6C08A,#10B981);border-radius:12px 12px 0 0;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Event Details</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;width:120px;">Event</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.eventType}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Date</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${formatDateDisplay(data.eventDate)}</td>
                      </tr>
                      ${data.pickupTime ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Time</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${formatTimeDisplay(data.pickupTime)}</td>
                      </tr>
                      ` : ''}
                      ${data.durationHours ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Duration</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.durationHours} hours</td>
                      </tr>
                      ` : ''}
                      ${data.vehicleName ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Vehicle</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.vehicleName}</td>
                      </tr>
                      ` : ''}
                      ${data.guestCount ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Guests</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.guestCount}</td>
                      </tr>
                      ` : ''}
                      ${data.pickupLocation ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Pickup</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.pickupLocation}</td>
                      </tr>
                      ` : ''}
                      ${data.dropoffLocation ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Drop-off</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.dropoffLocation}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment Summary Card -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 12px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Payment Summary</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Deposit Paid</td>
                        <td style="padding:6px 0;font-size:14px;color:#34D399;text-align:right;font-weight:600;">${fmt(data.depositAmount)}</td>
                      </tr>
                      ${data.balanceDue > 0 ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Remaining Balance</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(data.balanceDue)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Total</td>
                        <td style="padding:12px 0 0;font-size:20px;color:#D6C08A;text-align:right;font-weight:700;">${fmt(data.totalAmount)}</td>
                      </tr>
                      ` : `
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Paid in Full</td>
                        <td style="padding:12px 0 0;font-size:20px;color:#34D399;text-align:right;font-weight:700;">${fmt(data.totalAmount)}</td>
                      </tr>
                      `}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${data.balanceDue > 0 ? `
          <!-- Balance due note -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                The remaining balance of <strong style="color:#D6C08A;">${fmt(data.balanceDue)}</strong> is due 7 days prior to your event or cash upon arrival.
              </p>
            </td>
          </tr>
          ` : ''}

          <!-- What's Next -->
          <tr>
            <td style="padding:0 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">What's Next</p>
                    <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.6;">
                      We'll reach out with final details before your event. If you have any questions or need to make changes, don't hesitate to contact us.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Contact -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                Questions? Call us at <strong style="color:#D6C08A;">(702) 666-4037</strong> or reply to this email.
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#999;">
                We look forward to making your ${data.eventType.toLowerCase()} unforgettable!
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
