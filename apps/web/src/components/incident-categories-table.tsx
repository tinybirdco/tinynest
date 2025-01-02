import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { formatPercentage } from "@/lib/utils"
import { useState } from "react"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface IncidentType {
  title: string
  cloud: string
  cluster: string
  total_incidents: number
  high_urgency_incidents: number
  example_title: string
}

interface IncidentCategoriesTableProps {
  data: IncidentType[]
  page: number
  onPageChange: (page: number) => void
  pageSize: number
  isLoading: boolean
}

export default function IncidentCategoriesTable({ data, onPageChange, page, pageSize, isLoading }: IncidentCategoriesTableProps) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof IncidentType
    direction: 'asc' | 'desc'
  }>({ key: 'total_incidents', direction: 'desc' })

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1
    }
    return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1
  })

  const requestSort = (key: keyof IncidentType) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="max-w-[300px]">
                <Button variant="ghost" onClick={() => requestSort('title')}>
                  Title <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="max-w-[100px]">
                <Button variant="ghost" onClick={() => requestSort('cloud')}>
                  Cloud <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="max-w-[150px]">
                <Button variant="ghost" onClick={() => requestSort('cluster')}>
                  Cluster <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('total_incidents')}>
                  Total <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">
                <Button variant="ghost" onClick={() => requestSort('high_urgency_incidents')}>
                  High Urgency <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((item) => (
                <TableRow key={`${item.title}-${item.cloud}-${item.cluster}`}>
                  <TableCell className="truncate max-w-[300px]">{item.title}</TableCell>
                  <TableCell className="truncate max-w-[100px]">{item.cloud}</TableCell>
                  <TableCell className="truncate max-w-[150px]">{item.cluster}</TableCell>
                  <TableCell className="text-right">{item.total_incidents}</TableCell>
                  <TableCell className="text-right">{parseInt(formatPercentage(item.high_urgency_incidents / item.total_incidents * 100))}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            Page {page + 1}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={data.length < pageSize}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
} 