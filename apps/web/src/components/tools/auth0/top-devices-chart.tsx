'use client'

import { BarList } from '@tinybirdco/charts'

export function Auth0TopDevices(params: {
  client_id?: string
  connection_id?: string
  tenant_name?: string
  token?: string
  date_from?: string
  date_to?: string
}) {
  return <BarList 
    endpoint={`${process.env.NEXT_PUBLIC_TINYBIRD_API_HOST}/v0/pipes/auth0_top_devices.json`}
    token={params.token ?? ''}
    index="device"
    categories={['request_count']}
    colorPalette={['#000000']}
    height="250px"
    params={params}
    indexConfig={{
        label: 'DEVICE',
        renderBarContent: ({ label }) => (
        <span className="font-normal text-white [text-shadow:2px_1px_0px_#000]">{label}</span>
        )
    }}
    categoryConfig={{
        request_count: {
            label: <span>Requests</span>
        }
    }}
  />
}