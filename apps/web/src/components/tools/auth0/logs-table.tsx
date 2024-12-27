import { useState } from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { DateRangePicker, DateRange } from "@/components/ui/date-range-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface LogEntry {
  event_time: string
  event_type: string
  description: string
  id: string
  connection: string
  application: string
}

interface LogsTableProps {
  data: LogEntry[]
  page: number
  onPageChange: (page: number) => void
  isLoading?: boolean
  onFiltersChange: (filters: {
    dateRange?: DateRange
    eventType?: string
    connection?: string
    clientName?: string
  }) => void
  connections: Array<{ connection_id: string, connection_name: string }>
  applications: Array<{ client_id: string, client_name: string }>
  dateRange: DateRange
}

const EVENT_TYPE_NAMES: Record<string, string> = {
  'api_limit': 'Rate Limit on APIs',
  'appi': 'API Peak Performance Initiated',
  'ciba_exchange_failed': 'Failed CIBA Exchange',
  'ciba_exchange_succeeded': 'Successful CIBA Exchange',
  'ciba_start_failed': 'Failed CIBA Start',
  'ciba_start_succeeded': 'Successful CIBA Start',
  'cls': 'Code/Link Sent',
  'cs': 'Code Sent',
  'depnote': 'Deprecation Notice',
  'f': 'Failed Login',
  'fc': 'Failed by Connector',
  'fce': 'Failed Change Email',
  'fco': 'Failed by CORS',
  'fcoa': 'Failed Cross-Origin Authentication',
  'fcp': 'Failed Change Password',
  'fcph': 'Failed Post Change Password Hook',
  'fcpn': 'Failed Change Phone Number',
  'fcpr': 'Failed Change Password Request',
  'fcpro': 'Failed Connector Provisioning',
  'fcu': 'Failed Change Username',
  'fd': 'Failed Delegation',
  'fdeac': 'Failed Device Activation',
  'fdeaz': 'Failed Device Authorization',
  'fdecc': 'User Canceled Device Confirmation',
  'fdu': 'Failed User Deletion',
  'feacft': 'Failed Authorization Code Exchange',
  'feccft': 'Failed Client Credentials Exchange',
  'fede': 'Failed Device Code Exchange',
  'fens': 'Failed Native Social Login Exchange',
  'feoobft': 'Failed OOB Challenge Exchange',
  'feotpft': 'Failed OTP Challenge Exchange',
  'fepft': 'Failed Password Exchange',
  'fepotpft': 'Failed Passwordless OTP Exchange',
  'fercft': 'Failed MFA Recovery Code Exchange',
  'ferrt': 'Failed Rotating Refresh Token Exchange',
  'fertft': 'Failed Refresh Token Exchange',
  'fi': 'Failed Invite Accept',
  'flo': 'Failed Logout',
  'fn': 'Failed Notification',
  'fp': 'Failed Login (Wrong Password)',
  'fpar': 'Failed Pushed Authorization',
  'fs': 'Failed Signup',
  'fsa': 'Failed Silent Auth',
  'fu': 'Failed Login (Invalid Email)',
  'fui': 'Failed Users Import',
  'fv': 'Failed Verification Email',
  'fvr': 'Failed Verification Email Request',
  's': 'Success Login',
  'sapi': 'Success API Operation',
  'sce': 'Success Change Email',
  'scoa': 'Success Cross-Origin Authentication',
  'scp': 'Success Change Password',
  'scpn': 'Success Change Phone Number',
  'scpr': 'Success Change Password Request',
  'scu': 'Success Change Username',
  'sd': 'Success Delegation',
  'sdu': 'Success User Deletion',
  'seacft': 'Success Authorization Code Exchange',
  'seccft': 'Success Client Credentials Exchange',
  'sede': 'Success Device Code Exchange',
  'sens': 'Success Native Social Login',
  'seoobft': 'Success OOB Challenge Exchange',
  'seotpft': 'Success OTP Challenge Exchange',
  'sepft': 'Success Password Exchange',
  'sertft': 'Success Refresh Token Exchange',
  'si': 'Success Invite Accept',
  'slo': 'Success Logout',
  'ss': 'Success Signup',
  'ssa': 'Success Silent Auth',
  'sui': 'Success Users Import',
  'sv': 'Success Verification Email',
  'svr': 'Success Verification Email Request',
  'w': 'Warning During Login',
  'wum': 'Warning User Management'
}

type SortField = 'event_time' | 'event_type' | 'description' | 'id' | 'connection' | 'application'
type SortDirection = 'asc' | 'desc'

export function LogsTable({ 
  data, 
  page, 
  onPageChange, 
  isLoading,
  onFiltersChange,
  connections,
  applications,
  dateRange
}: LogsTableProps) {
  const [sortField, setSortField] = useState<SortField>('event_time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''

    if (sortField === 'event_type') {
      const aName = EVENT_TYPE_NAMES[aValue] || aValue
      const bName = EVENT_TYPE_NAMES[bValue] || bValue
      return sortDirection === 'asc' 
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName)
    }

    return sortDirection === 'asc' 
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <DateRangePicker
          initialDateRange={dateRange}
          onChange={(range) => onFiltersChange({ dateRange: range })}
        />
        <Select onValueChange={(value) => onFiltersChange({ eventType: value })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Event Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {Object.entries(EVENT_TYPE_NAMES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onFiltersChange({ connection: value })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Connection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Connections</SelectItem>
            {connections.map((conn) => (
              <SelectItem key={conn.connection_id} value={conn.connection_name}>
                {conn.connection_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={(value) => onFiltersChange({ clientName: value })}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Application" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Applications</SelectItem>
            {applications.map((app) => (
              <SelectItem key={app.client_id} value={app.client_name}>
                {app.client_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="relative">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('event_time')}
                  className="h-8 flex items-center gap-1"
                >
                  Timestamp
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('event_type')}
                  className="h-8 flex items-center gap-1"
                >
                  Type
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('description')}
                  className="h-8 flex items-center gap-1"
                >
                  Description
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('id')}
                  className="h-8 flex items-center gap-1"
                >
                  ID
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('connection')}
                  className="h-8 flex items-center gap-1"
                >
                  Connection
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort('application')}
                  className="h-8 flex items-center gap-1"
                >
                  Application
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">{format(new Date(log.event_time), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                <TableCell className="font-medium truncate max-w-[150px]">
                  {EVENT_TYPE_NAMES[log.event_type] || log.event_type}
                </TableCell>
                <TableCell className="truncate max-w-[300px]">{log.description}</TableCell>
                <TableCell className="font-mono text-xs truncate max-w-[200px]">{log.id}</TableCell>
                <TableCell className="truncate max-w-[150px]">{log.connection || 'N/A'}</TableCell>
                <TableCell className="truncate max-w-[150px]">{log.application || 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium">Page {page + 1}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={data.length === 0 || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
} 