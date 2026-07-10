export async function GET() {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID
  const pubId = clientId?.replace('ca-pub-', 'pub-')
  const body = pubId ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n` : ''

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
