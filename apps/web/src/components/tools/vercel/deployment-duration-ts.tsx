'use client'

import { LineChart } from '@tinybirdco/charts'

export function VercelDeploymentDuration(params: {
  date_from?: string
  date_to?: string
  time_range?: string
}) {
  return (
    <LineChart
      endpoint="https://api.tinybird.co/v0/pipes/vercel_deployment_duration.json"
      token = "p.eyJ1IjogIjdjNjJiZGRjLWQ3MDItNDBiMy04YTc5LTdkYWQ4ODZmN2FhYiIsICJpZCI6ICIwYWYxMDYzMi1iMTdhLTQzMWEtYjlkOS0wZjdlZWU1M2I3ODMiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.EUq1kGyKew75WAzACmSmPLjfjDI0F5Jj0DXQAQSqhD8"
      index="period"
      categories={['avg_duration', 'p95_duration']}
      colorPalette={['#27F795', '#008060', '#0EB1B9', '#9263AF', '#5A6FC0', '#86BFDB', '#FFC145', '#FF6B6C', '#DC82C8', '#FFC0F1']}
      stacked={true}
      title="Vercel Deployment Duration"
      height="500px"
      params={params}
    />
  )
}