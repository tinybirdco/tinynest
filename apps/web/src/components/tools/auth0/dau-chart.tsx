"use client"

import { AreaChart } from '@tinybirdco/charts'

export function Auth0Dau(params: {
  client_id?: string
  connection_id?: string
  tenant_name?: string
  token?: string
  date_from?: string
  date_to?: string
  time_range?: string
}) {
  return <AreaChart
    endpoint={`${process.env.NEXT_PUBLIC_TINYBIRD_API_HOST}/v0/pipes/auth0_dau_ts.json`}
    token={params.token ?? ''}
    index="day"
    categories={['active']}
    height="200px"
    params={params}
    colorPalette={['#000000']}
  />
}