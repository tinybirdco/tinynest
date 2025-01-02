"use client"

import { useQueryState } from 'nuqs'
import { useState, useEffect } from 'react'
import { pipe } from '@/lib/tinybird'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDuration, formatNumber, formatPercentage } from '@/lib/utils'
import Overview from '@/components/overview-chart'
import BarList from '@/components/bar-list'
import { DateRangePicker, DateRange } from '@/components/ui/date-range-picker'
import { startOfDay, endOfDay, format } from 'date-fns'
import MetricCard from '@/components/metric-card'
import IncidentCategoriesTable from "@/components/incident-categories-table"
import { Filter } from './filters'

interface IncidentType {
  title: string
  cloud: string
  cluster: string
  total_incidents: number
  high_urgency_incidents: number
  example_title: string
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
    event_type: string
    count: number
  }>>([])
  const [serviceDistribution, setServiceDistribution] = useState<Array<{
    service: string
    incidents: number
    high_urgency: number
    high_urgency_rate: number
  }>>([])
  const [responders, setResponders] = useState<Array<{
    responder: string
    responses: number
    avg_response_time: number
  }>>([])
  const [statusDistribution, setStatusDistribution] = useState<Array<{
    event_type: string
    count: number
    percentage: number
  }>>([])
  const [page, setPage] = useState(0)
  const pageSize = 10
  const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([])
  const [services, setServices] = useState<Array<{
    service_name: string
    service_id: string
  }>>([])
  const [selectedService, setSelectedService] = useState<string>()

  const fetchIncidentTypes = async (newPage: number) => {
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
  }

  const handlePageChange = async (newPage: number) => {
    setPage(newPage)
    await fetchIncidentTypes(newPage)
  }

  useEffect(() => {
    fetchMetrics()
  }, [token, dateRange.from, dateRange.to, selectedService])

  useEffect(() => {
    fetchIncidentTypes(page)
  }, [token, dateRange.from, dateRange.to, selectedService, page])

  const fetchMetrics = async () => {
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
        incidentTypesData
      ] = await Promise.all([
        pipe(token, 'pagerduty_incident_metrics', baseParams),
        pipe(token, 'pagerduty_incidents_over_time', baseParams),
        pipe(token, 'pagerduty_responders', baseParams),
        pipe(token, 'pagerduty_status_distribution', baseParams),
        pipe(token, 'pagerduty_resolution_times', baseParams),
        pipe(token, 'pagerduty_service_distribution', baseParams),
        pipe(token, 'pagerduty_incident_types', baseParams)
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
        event_type: string
        count: number
      }>)
      setResponders(respondersData.data as Array<{
        responder: string
        responses: number
        avg_response_time: number
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

    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServices = async () => {
    if (!token) return
    try {
      const servicesData = await pipe(token, 'pagerduty_services')
      setServices(servicesData.data)
    } catch (error) {
      console.error('Failed to fetch services:', error)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [token])

  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center gap-4">
        <Filter
          token={token}
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
              'triggered': '#dc2626',    // Red-600
              'resolved': '#16a34a',     // Green-600
              'escalated': '#d97706'     // Amber-600
            }}
            index="hour"
            valueKey="count"
            categoryKey="type"
          />
        </CardContent>
      </Card>

      {/* Response Analysis */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Response Team Activity</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[400px] overflow-auto">
            <BarList
              data={(responders || []).map((item) => ({
                name: item.responder,
                value: item.responses,
                extra: `${formatDuration(item.avg_response_time)} avg response time`,
              }))}
            />
          </CardContent>
        </Card>
        <div className="col-span-2">
          <IncidentCategoriesTable 
            data={incidentTypes || []}
            page={page}
            onPageChange={handlePageChange}
            pageSize={pageSize}
          />
        </div>
      </div>
    </div>
  )
}
