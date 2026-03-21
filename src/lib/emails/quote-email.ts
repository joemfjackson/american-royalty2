interface QuoteEmailData {
  clientName: string
  eventType: string
  eventDate: string
  pickupTime: string | null
  durationHours: number
  hourlyRate: number
  baseFare: number
  fuelSurcharge: number
  customItems: { description: string; amount: number }[]
  taxAmount: number
  driverGratuity: number
  total: number
  depositPercent: number
  depositAmount: number
  quoteUrl: string
  adminNotes: string | null
}

function fmt(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function buildQuoteEmailHtml(data: QuoteEmailData): string {
  const subtotal = data.baseFare + data.fuelSurcharge + data.customItems.reduce((s, i) => s + i.amount, 0)

  const customItemRows = data.customItems
    .map((item) => `
      <tr>
        <td style="padding:6px 0;font-size:14px;color:#ccc;">${item.description}</td>
        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(item.amount)}</td>
      </tr>`)
    .join('')

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
              <img src="${data.quoteUrl.split('/quote/')[0]}/images/logo.png" alt="American Royalty" width="180" height="180" style="display:block;margin:0 auto;width:180px;height:auto;" />
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
                Thank you for reaching out to American Royalty! We'd love to be part of your ${data.eventType.toLowerCase()}.
              </p>
              <p style="margin:12px 0 0;font-size:15px;color:#cccccc;line-height:1.5;">
                Here's your quote:
              </p>
            </td>
          </tr>

          <!-- Event Details -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <tr>
                  <td style="padding:20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#999;width:100px;">Date</td>
                        <td style="padding:4px 0;font-size:14px;color:#fff;font-weight:500;">${data.eventDate}</td>
                      </tr>
                      ${data.pickupTime ? `
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#999;">Time</td>
                        <td style="padding:4px 0;font-size:14px;color:#fff;font-weight:500;">${data.pickupTime}</td>
                      </tr>
                      ` : ''}
                      <tr>
                        <td style="padding:4px 0;font-size:14px;color:#999;">Duration</td>
                        <td style="padding:4px 0;font-size:14px;color:#fff;font-weight:500;">${data.durationHours} hours</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown -->
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
                        <td style="padding:6px 0;font-size:14px;color:#ccc;">Base Fare <span style="color:#999;font-size:12px;">(${data.durationHours} hrs &times; ${fmt(data.hourlyRate)}/hr)</span></td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(data.baseFare)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#ccc;">NTA Fuel Surcharge</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(data.fuelSurcharge)}</td>
                      </tr>
                      ${customItemRows}
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0;font-size:14px;color:#ccc;">Subtotal</td>
                        <td style="padding:8px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(subtotal)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#ccc;">NTA Excise Tax (3%)</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(data.taxAmount)}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#ccc;">Driver Gratuity</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;">${fmt(data.driverGratuity)}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Total</td>
                        <td style="padding:12px 0 0;font-size:20px;color:#D6C08A;text-align:right;font-weight:700;">${fmt(data.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Deposit note -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.5;">
                A ${data.depositPercent}% deposit of <strong style="color:#D6C08A;">${fmt(data.depositAmount)}</strong> is required to secure your date, with the remaining balance due 7 days prior to your event or cash upon arrival.
              </p>
            </td>
          </tr>

          ${data.adminNotes ? `
          <!-- Admin Notes -->
          <tr>
            <td style="padding:0 0 24px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">${data.adminNotes}</p>
            </td>
          </tr>
          ` : ''}

          <!-- CTA Button -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <a href="${data.quoteUrl}" style="display:inline-block;background-color:#D6C08A;color:#000000;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:8px;letter-spacing:0.5px;">
                VIEW QUOTE &amp; BOOK
              </a>
            </td>
          </tr>

          <!-- Alternative contact -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:14px;color:#cccccc;line-height:1.5;">
                Ready to book? Reply to this email or call us at <strong style="color:#D6C08A;">(702) 666-4037</strong>.
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
