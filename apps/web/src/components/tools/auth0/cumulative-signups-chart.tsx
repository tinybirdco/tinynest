'use client'

import { BarChart } from '@tinybirdco/charts'

export function Auth0CumulativeSignups(params: {
  client_id?: string
  connection_id?: string
  tenant_name?: string
  token?: string
  date_from?: string
  date_to?: string
}) {
  return <BarChart 
    endpoint={`${process.env.NEXT_PUBLIC_TINYBIRD_API_HOST}/v0/pipes/auth0_cumulative_users.json`}
    token={params.token ?? ''}
    index="day"
    categories={['cumulative_users', 'new_users']}
    height="200px"
    params={params}
    stacked={true}
    colorPalette={['#000000', '#aaaaaa']}
  />
}