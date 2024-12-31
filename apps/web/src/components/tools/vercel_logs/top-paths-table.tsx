import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TopPathData {
    path: string
    requests: number
    error_rate: number
    cache_hit_rate: number
}

interface TopPathsTableProps {
    data: TopPathData[]
    isLoading: boolean
    className?: string
    page: number
    onPageChange: (page: number) => void
    pageSize?: number
}

export function TopPathsTable({ 
    data, 
    isLoading, 
    className,
    page,
    onPageChange,
    pageSize = 100
}: TopPathsTableProps) {
    if (isLoading) return <div className={`flex items-center justify-center ${className}`}>Loading...</div>
    if (!data.length) return <div className={`flex items-center justify-center ${className}`}>No data available</div>

    return (
        <div className={cn("flex flex-col h-full", className)}>
            <div className="flex-1 min-h-0 overflow-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                            <TableHead>Path</TableHead>
                            <TableHead className="text-right">Requests</TableHead>
                            <TableHead className="text-right">Error Rate</TableHead>
                            <TableHead className="text-right">Cache Hit Rate</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row) => (
                            <TableRow key={row.path}>
                                <TableCell className="font-mono">{row.path}</TableCell>
                                <TableCell className="text-right">{row.requests}</TableCell>
                                <TableCell className="text-right">{row.error_rate}%</TableCell>
                                <TableCell className="text-right">{row.cache_hit_rate}%</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                <div className="text-sm text-muted-foreground">
                    Page {page + 1}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(page + 1)}
                    disabled={data.length < pageSize || isLoading}
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
} 