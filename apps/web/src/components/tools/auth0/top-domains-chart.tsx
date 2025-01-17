'use client'

import { BarList } from '@tinybirdco/charts'

export function Auth0TopDomains(params: {
  client_id?: string
  connection_id?: string
  tenant_name?: string
  token?: string
  date_from?: string
  date_to?: string
}) {
  return <BarList 
    endpoint={`${process.env.NEXT_PUBLIC_TINYBIRD_API_HOST}/v0/pipes/auth0_top_domains.json`}
    token={params.token ?? ''}
    index="domain"
    categories={['unique_emails']}
    colorPalette={['#000000']}
    height="250px"
    params={params}
    indexConfig={{
        label: 'DOMAIN',
        renderBarContent: ({ label }) => (
        <span className="font-normal text-white [text-shadow:2px_1px_0px_#000]">{label}</span>
        )
    }}
    categoryConfig={{
        unique_emails: {
            label: <span>Unique Users</span>
        }
    }}
  />
}