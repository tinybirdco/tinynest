import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"

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

export function LogsTable({ data }: LogsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">Timestamp</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Connection</TableHead>
          <TableHead>Application</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((log) => (
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
  )
} 