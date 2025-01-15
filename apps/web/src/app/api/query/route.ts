import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const query = searchParams.get('query');

  if (!token || !query) {
    return NextResponse.json({ error: 'Token and query are required' }, { status: 400 });
  }

  const url = new URL(`${process.env.NEXT_PUBLIC_TINYBIRD_API_HOST}/v0/sql`);
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  return NextResponse.json(data);
}
