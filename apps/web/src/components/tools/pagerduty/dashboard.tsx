"use client"

import { useQueryState } from 'nuqs'
import { useState, useEffect, useCallback } from 'react'
import { pipe } from '@/lib/tinybird'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration, formatNumber, formatPercentage } from '@/lib/utils'
import Overview from '@/components/tools/pagerduty/overview-chart'
import BarList from '@/components/bar-list'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { startOfDay, endOfDay, format } from 'date-fns'
import MetricCard from '@/components/metric-card'
import IncidentCategoriesTable from "@/components/tools/pagerduty/incident-categories-table"
import { Filter } from './filters'
import InterruptionsChart from "@/components/tools/pagerduty/interruptions-chart"
import ResponseEffortChart from "@/components/tools/pagerduty/response-effort-chart"
import SleepInterruptions from "@/components/tools/pagerduty/sleep-interruptions"

interface IncidentType {
  title: string
  cloud: string
  cluster: string
  total_incidents: number
  high_urgency_incidents: number
  example_title: string
}

interface Responder {
  html_url: string;
  id: string;
  self: string;
  summary: string;
  type: string;
}

interface InterruptionData {
  day: string
  interruptions: number
  day_type: 'business' | 'off'
}

export default function PagerDutyDashboard() {
  const [token] = useQueryState('token')
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date(new Date().setDate(new Date().getDate() - 7))),
    to: endOfDay(new Date())
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isTableLoading, setIsTableLoading] = useState(false)
  const [metrics, setMetrics] = useState({
    total_incidents: 0,
    escalation_rate: 0,
    resolution_rate: 0
  })
  const [resolutionTimes, setResolutionTimes] = useState({
    avg_time_to_resolve: 0,
    avg_time_to_last_update: 0
  })
  const [incidentsOverTime, setIncidentsOverTime] = useState<Array<{
    hour: string
    triggered: number
    resolved: number
    escalated: number
  }>>([])
  const [serviceDistribution, setServiceDistribution] = useState<Array<{
    service: string
    incidents: number
    high_urgency: number
    high_urgency_rate: number
  }>>([])
  const [responders, setResponders] = useState<Array<{
    responder: Responder[];
    responses: number;
    acknowledgements: number;
    avg_response_time: number;
  }>>([])
  const [statusDistribution, setStatusDistribution] = useState<Array<{
    event_type: string
    count: number
    percentage: number
  }>>([])
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([])
  const [selectedService, setSelectedService] = useState<string>()
  const [interruptions, setInterruptions] = useState<InterruptionData[]>([])
  const [responseEffort, setResponseEffort] = useState<Array<{
    responder: Array<{
      html_url: string
      id: string
      self: string
      summary: string
      type: string
    }>
    hours: number
  }>>([])
  const [sleepInterruptions, setSleepInterruptions] = useState<Array<{
    responder: Array<{
      html_url: string
      id: string
      self: string
      summary: string
      type: string
    }>
    interruptions: number
    avg_response_time: number
  }>>([])

  const fetchIncidentTypes = useCallback(async (newPage: number) => {
    if (!token) return
    setIsTableLoading(true)
    try {
      const fromDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
      const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")

      const incidentTypesData = await pipe(token, 'pagerduty_incident_types', {
        date_from: fromDate,
        date_to: toDate,
        page: newPage,
        page_size: pageSize,
        ...(selectedService ? { service_id: selectedService } : {})
      })

      setIncidentTypes(incidentTypesData.data as IncidentType[])
    } catch (error) {
      console.error('Failed to fetch incident types:', error)
    } finally {
      setIsTableLoading(false)
    }
  }, [token, dateRange.from, dateRange.to, selectedService, pageSize])

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
    await fetchIncidentTypes(newPage)
  }

  const fetchMetrics = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const fromDate = dateRange.from ? format(dateRange.from, "yyyy-MM-dd HH:mm:ss") : format(startOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")
      const toDate = dateRange.to ? format(dateRange.to, "yyyy-MM-dd HH:mm:ss") : format(endOfDay(new Date()), "yyyy-MM-dd HH:mm:ss")

      const baseParams = {
        date_from: fromDate,
        date_to: toDate,
        page,
        page_size: pageSize,
        ...(selectedService ? { service_id: selectedService } : {})
      }

      const [
        incidentMetrics,
        incidentsOverTimeData,
        respondersData,
        statusDistributionData,
        resolutionTimesData,
        serviceDistributionData,
        incidentTypesData,
        interruptionsData,
        responseEffortData,
        sleepInterruptionsData
      ] = await Promise.all([
        pipe(token, 'pagerduty_incident_metrics', baseParams),
        pipe(token, 'pagerduty_incidents_over_time', baseParams),
        pipe(token, 'pagerduty_responders', baseParams),
        pipe(token, 'pagerduty_status_distribution', baseParams),
        pipe(token, 'pagerduty_resolution_times', baseParams),
        pipe(token, 'pagerduty_service_distribution', baseParams),
        pipe(token, 'pagerduty_incident_types', baseParams),
        pipe(token, 'pagerduty_interruptions', baseParams),
        pipe(token, 'pagerduty_response_effort', baseParams),
        pipe(token, 'pagerduty_sleep_interruptions', baseParams)
      ])

      setMetrics((incidentMetrics?.data?.[0] || {
        total_incidents: 0,
        escalation_rate: 0,
        resolution_rate: 0
      }) as {
        total_incidents: number;
        escalation_rate: number;
        resolution_rate: number;
      })
      setIncidentsOverTime(incidentsOverTimeData.data as Array<{
        hour: string
        triggered: number
        resolved: number
        escalated: number
      }>)
      setResponders(respondersData.data as Array<{
        responder: Responder[];
        responses: number;
        acknowledgements: number;
        avg_response_time: number;
      }>)
      setStatusDistribution(statusDistributionData.data as Array<{
        event_type: string
        count: number
        percentage: number
      }>)
      setResolutionTimes((resolutionTimesData?.data?.[0] || {
        avg_time_to_resolve: 0,
        avg_time_to_last_update: 0
      }) as {
        avg_time_to_resolve: number;
        avg_time_to_last_update: number;
      })
      setServiceDistribution(serviceDistributionData.data as Array<{
        service: string
        incidents: number
        high_urgency: number
        high_urgency_rate: number
      }>)
      setIncidentTypes(incidentTypesData.data as IncidentType[])
      setInterruptions(interruptionsData.data as InterruptionData[])
      setResponseEffort(responseEffortData.data as Array<{
        responder: Array<{
          html_url: string
          id: string
          self: string
          summary: string
          type: string
        }>
        hours: number
      }>)
      setSleepInterruptions(sleepInterruptionsData.data as Array<{
        responder: Array<{
          html_url: string
          id: string
          self: string
          summary: string
          type: string
        }>
        interruptions: number
        avg_response_time: number
      }>)

    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }, [token, dateRange.from, dateRange.to, selectedService])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  useEffect(() => {
    fetchIncidentTypes(page)
  }, [fetchIncidentTypes, page])

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center gap-4">
        <Filter
          token={token || ''}
          pipeName="pagerduty_services"
          label="Service"
          value={selectedService}
          onChange={setSelectedService}
        />
        <DateRangePicker
          initialDateRange={dateRange}
          onChange={(newRange) => setDateRange(newRange)}
        />
      </div>
      {/* Service Analysis */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Most Impacted Services</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceDistribution && (
              <BarList
                data={serviceDistribution.map((item) => ({
                  name: item.service,
                  value: item.incidents,
                  extra: `${item.incidents} total incidents`,
                }))}
              />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Services by High Urgency</CardTitle>
          </CardHeader>
          <CardContent>
            <BarList
              data={(serviceDistribution || []).map((item) => ({
                name: item.service,
                value: item.high_urgency,
                extra: `${formatPercentage(item.high_urgency_rate)} high urgency rate`,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Primary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Incidents"
          value={formatNumber(metrics.total_incidents)}
          isLoading={isLoading}
        />
        <MetricCard
          title="Open Incidents"
          value={formatNumber((statusDistribution || []).find(s => s.event_type === 'incident.triggered')?.count || 0)}
          isLoading={isLoading}
        />
        <MetricCard
          title="Mean Time to Resolution"
          value={formatDuration(resolutionTimes.avg_time_to_resolve)}
          isLoading={isLoading}
        />
        <MetricCard
          title="Resolution Rate"
          value={formatPercentage(metrics.resolution_rate)}
          isLoading={isLoading}
        />
        <MetricCard
          title="Escalation Rate"
          value={formatPercentage(metrics.escalation_rate)}
          isLoading={isLoading}
        />
      </div>

      {/* Incident Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <Overview 
            data={incidentsOverTime} 
            categories={['triggered', 'resolved', 'escalated']}
            colors={{
              'triggered': 'hsl(var(--primary))',    // Red-600
              'resolved': '#93c5fd',     // Green-600
              'escalated': '#6b7280'     // Amber-600
            }}
            index="hour"
            valueKey="count"
            categoryKey="type"
          />
        </CardContent>
      </Card>

      {/* Response Analysis */}
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Oncall Team Activity</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-auto">
            <BarList
              data={responders
                .reduce((acc, item) => {
                  if (item.responder.length > 1) return acc;

                  const name = item.responder[0]?.summary || 'Unknown'
                  const existing = acc.find(x => x.name === name)
                  if (existing) {
                    existing.value += item.responses
                    existing.acknowledgements += item.acknowledgements
                    existing.avgTime = (existing.avgTime * existing.count + item.avg_response_time) / (existing.count + 1)
                    existing.count++
                  } else {
                    acc.push({
                      name,
                      value: item.responses,
                      acknowledgements: item.acknowledgements,
                      avgTime: item.avg_response_time,
                      count: 1
                    })
                  }
                  return acc
                }, [] as Array<{
                  name: string
                  value: number
                  acknowledgements: number
                  avgTime: number
                  count: number
                }>)
                .map(item => ({
                  name: item.name,
                  value: item.value,
                  extra: `${item.acknowledgements} acks • ${formatDuration(item.avgTime)} avg response time`
                }))
              }
            />
          </CardContent>
        </Card>
        <ResponseEffortChart data={responseEffort} />
      </div>

      <div className="grid gap-4 grid-cols-2">
        <InterruptionsChart data={interruptions} />
        <SleepInterruptions data={sleepInterruptions} />
      </div>

      <IncidentCategoriesTable 
          data={incidentTypes || []}
          page={page}
          onPageChange={handlePageChange}
          pageSize={pageSize}
          isLoading={isTableLoading}
        />
    </div>
  )
}
