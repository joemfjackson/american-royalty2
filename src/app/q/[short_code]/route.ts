import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ short_code: string }> }
) {
  const { short_code } = await params

  const record = await prisma.quoteShortCode.findUnique({
    where: { shortCode: short_code },
  })

  if (!record) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL || 'https://www.americanroyaltylasvegas.com'))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.americanroyaltylasvegas.com'
  return NextResponse.redirect(`${siteUrl}/quote/view/${record.quoteToken}`, 301)
}
