import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const query = searchParams.get('query');

  if (!token || !query) {
    return NextResponse.json({ error: 'Token and query are required' }, { status: 400 });
  }

  const url = new URL('https://api.tinybird.co/v0/sql');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  console.log(data);
  return NextResponse.json(data);
}
