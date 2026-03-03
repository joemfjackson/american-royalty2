interface QuoteEmailData {
  clientName: string
  eventType: string
  eventDate: string
  vehicleName: string | null
  lineItems: { description: string; quantity: number; unitPrice: number }[]
  totalAmount: string
  quoteUrl: string
  brandPhone: string
  brandEmail: string
}

function formatCurrencyInline(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export function buildQuoteEmailHtml(data: QuoteEmailData): string {
  const lineItemRows = data.lineItems
    .map((item) => {
      const lineTotal = item.quantity * item.unitPrice
      const qtyLabel = item.quantity > 1
        ? `${item.quantity} × ${formatCurrencyInline(item.unitPrice)}`
        : ''
      return `
        <tr>
          <td style="padding:8px 0;font-size:14px;color:#ccc;">${item.description}</td>
          <td style="padding:8px 0;font-size:13px;color:#999;text-align:center;width:120px;">${qtyLabel}</td>
          <td style="padding:8px 0;font-size:14px;color:#fff;text-align:right;font-weight:500;width:100px;">${formatCurrencyInline(lineTotal)}</td>
        </tr>`
    })
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
          <!-- Header -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <h1 style="margin:0;font-size:28px;font-weight:700;color:#D6C08A;letter-spacing:2px;">AMERICAN ROYALTY</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#999;letter-spacing:3px;">RIDE LIKE ROYALTY</p>
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
                Thank you for your interest in American Royalty! Here is your personalized quote for your upcoming event.
              </p>
            </td>
          </tr>

          <!-- Event Details Card -->
          <tr>
            <td style="padding:0 0 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
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
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.eventDate}</td>
                      </tr>
                      ${data.vehicleName ? `
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#999;">Vehicle</td>
                        <td style="padding:6px 0;font-size:14px;color:#fff;font-weight:500;">${data.vehicleName}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pricing Breakdown Card -->
          <tr>
            <td style="padding:0 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;border:1px solid #1E1E1E;border-radius:12px;">
                <!-- Gold top accent -->
                <tr>
                  <td style="padding:0;">
                    <div style="height:3px;background:linear-gradient(to right,#D6C08A,#6F2DBD);border-radius:12px 12px 0 0;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px;">
                    <p style="margin:0 0 16px;font-size:11px;font-weight:600;color:#999;letter-spacing:2px;text-transform:uppercase;">Pricing Breakdown</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${lineItemRows}
                      <tr>
                        <td colspan="3" style="padding:8px 0 0;">
                          <div style="height:1px;background-color:#1E1E1E;"></div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0 0;font-size:16px;color:#fff;font-weight:600;">Total</td>
                        <td style="padding:12px 0 0;"></td>
                        <td style="padding:12px 0 0;font-size:20px;color:#D6C08A;text-align:right;font-weight:700;">${data.totalAmount}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <a href="${data.quoteUrl}" style="display:inline-block;background-color:#D6C08A;color:#000000;font-size:16px;font-weight:700;text-decoration:none;padding:16px 48px;border-radius:8px;letter-spacing:0.5px;">
                VIEW FULL QUOTE
              </a>
            </td>
          </tr>

          <!-- Validity note -->
          <tr>
            <td style="text-align:center;padding:0 0 32px;">
              <p style="margin:0;font-size:13px;color:#999;line-height:1.5;">
                This quote is valid for 14 days.<br>
                Have questions? We&rsquo;d love to hear from you.
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
              <p style="margin:0;font-size:13px;color:#D6C08A;font-weight:600;">American Royalty Las Vegas</p>
              <p style="margin:8px 0 0;font-size:13px;color:#999;">
                ${data.brandPhone} | ${data.brandEmail}
              </p>
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
