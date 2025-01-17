'use client'

import { BarChart } from '@tinybirdco/charts'

export function VercelDeploymentsOverTime(params: {
  date_from?: string
  date_to?: string
  time_range?: string
}) {
  return (
    <BarChart
      endpoint="https://api.tinybird.co/v0/pipes/vercel_deployments_over_time.json"
      token = "p.eyJ1IjogIjdjNjJiZGRjLWQ3MDItNDBiMy04YTc5LTdkYWQ4ODZmN2FhYiIsICJpZCI6ICIwYWYxMDYzMi1iMTdhLTQzMWEtYjlkOS0wZjdlZWU1M2I3ODMiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.EUq1kGyKew75WAzACmSmPLjfjDI0F5Jj0DXQAQSqhD8"
      index="period"
      categories={['count']}
      colorPalette={['#27F795', '#008060', '#0EB1B9', '#9263AF', '#5A6FC0', '#86BFDB', '#FFC145', '#FF6B6C', '#DC82C8', '#FFC0F1']}
      stacked={true}
      groupBy="event_type"
      title="Vercel Deployments Over Time"
      height="500px"
      params={params}
    />
  )
}