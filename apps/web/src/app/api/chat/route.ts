import { createAnthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { getInstalledDataSources } from '@/lib/tinybird';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;
const apiKey = process.env.ANTHROPIC_API_KEY;

const event_type_context = `
tool,event_type,description
auth0,api_limit,"The maximum number of requests to the Authentication or Management APIs in given time was reached"
auth0,appi,"API Peak Performance Rate is initiated"
auth0,cls,"Passwordless Login Code/Link Sent"
auth0,cs,"Passwordless Login Code Sent"
auth0,depnote,"Deprecation Notice"
auth0,f,"Failed Login This is only emitted if the error is not covered by the 'fp' or 'fu' log types"
auth0,fce,"Failed to change user email"
auth0,fco,"Failed due to CORS. Is the origin in the Allowed Origins list for the specified application?"
auth0,fcoa,"Failed Cross-Origin Authentication"
auth0,fcp,"Failed Change Password"
auth0,fcph,"Failed Post Change Password Hook"
auth0,fcpn,"Failed Change Phone Number"
auth0,fcpr,"Failed Change Password Request"
auth0,fcpro,"Failed to provision a AD/LDAP connector"
auth0,fcu,"Failed to change username"
auth0,fd,"Failed to generate delegation token"
auth0,fdeac,"Failed Device Confirmation - Device Activation Failure"
auth0,fdeaz,"Failed Device Confirmation - Request Failure"
auth0,fdecc,"Failed Device Confirmation - User Canceled"
auth0,fdu,"Failed User Deletion"
auth0,feacft,"Failed to Exchange Authorization Code for Access Token"
auth0,feccft,"Failed exchange of Access Token for a Client Credentials Grant"
auth0,fede,"Failed to exchange Device Code for Access Token"
auth0,fens,"Failed exchange for Native Social Login"
auth0,feoobft,"Failed exchange of Password and OOB Challenge for Access Token"
auth0,feotpft,"Failed exchange of Password and OTP Challenge for Access Token"
auth0,fepft,"Failed exchange of Password for Access Token"
auth0,fepotpft,"Failed exchange of Passwordless OTP for Access Token"
auth0,fercft,"Failed Exchange of Password and MFA Recovery Code for Access Token"
auth0,ferrt,"Failed Exchange of Rotating Refresh Token. This could occur when reuse is detected."
auth0,fertft,"Failed Exchange of Refresh Token for Access Token. This could occur if the refresh token is revoked or expired."
auth0,fi,"Failed to accept a user invitation. This could happen if the user accepts an invitation using a different email address than provided in the invitation; or due to a system failure while provisioning the invitation."
auth0,flo,"Failed Logout"
auth0,fn,"Failed Notification"
auth0,fp,"Failed login due to invalid password"
auth0,fpar,"Failed Push Authorization Request"
auth0,fpurh,"Failed Post User Registration Hook"
auth0,fs,"Failed Signup"
auth0,fsa,"Failed Silent Auth"
auth0,fu,"Failed login due to invalid username"
auth0,fv,"Failed to send verification email"
auth0,fvr,"Failed to proces verification email request"
auth0,gd_auth_failed,"Multi-factor authentication failed. This could happen due to a wrong code entered for SMS/Voice/Email/TOTP factors; or a system failure."
auth0,gd_auth_rejected,"User rejected a multi-factor authentication request via push-notification"
auth0,gd_enrollment_complete,"A first time MFA user has successfully enrolled using one of the factors"
auth0,gd_otp_rate_limit_exceed,"A user; during enrollment or authentication; enters an incorrect code more than the maximum allowed number of times. Ex: A user enrolling in SMS enters the 6-digit code wrong more than 10 times in a row."
auth0,gd_recovery_failed,"A user entered a wrong Recovery Code when attempting to authenticate"
auth0,gd_send_pn,"Push notification for MFA sent successfully sent"
auth0,gd_send_pn_failure,"Push notification for MFA failed"
auth0,limit_delegation,"A user is temporarily prevented from logging in because of too many delegation requests"
auth0,limit_mu,"An IP address is blocked because it attempted too many failed logins without a successful login. Or an IP address is blocked because it attempted too many sign-ups; whether successful or failed."
auth0,limit_sul,"A user is temporarily prevented from logging in because they  reached the maximum logins per time period from the same IP address"
auth0,limit_wc,"An IP address is blocked because it reached the maximum failed login attempts into a single account."
auth0,mfar,"A user has been prompted for multi-factor authentication (MFA). When using Adaptive MFA; Auth0 includes details about the risk assessment"
auth0,mgmt_api_read,"Successful GET request on the management API. This event will only be emitted if a secret is returned."
auth0,pla,"Generated before a login and helps in monitoring the behavior of bot detection without having to enable it."
auth0,pwd_leak,"Someone behind the IP address ip attempted to login with a leaked password"
auth0,refresh_tokens_revoked_by_session,"Successfully revoked a refresh token"
auth0,resource_cleanup,"Emitted when resources exceeding defined limits were removed. Normally related to refresh tokens"
auth0,s,"Successful Login"
auth0,sapi,"Successful API Operation Only emitted by the Management API on POST; DELETE; PATCH; and PUT"
auth0,sce,"Successful Change Email"
auth0,scoa,"Successful Cross-Origin Authentication"
auth0,scp,"Successful Change Password"
auth0,scph,"Successful Post Change Password Hook"
auth0,scpn,"Successful Change Phone Number"
auth0,scpr,"Successful Change Password Request"
auth0,scu,"Successful Change Username"
auth0,sd,"Successful Delegation"
auth0,sdu,"Successful User Deletion"
auth0,seacft,"Successful Exchange of Authorization Code for Access Token"
auth0,seccft,"Successful Exchange of Access Token for a Client Credentials Grant"
auth0,sede,"Successful Exchange of Device Code for Access Token"
auth0,sens,"Successful Exchange - Native Social Login"
auth0,seoobft,"Successful Exchange of Password and OOB Challenge for Access Token"
auth0,seotpft,"Successful Exchange of Password and OTP Challenge for Access Token"
auth0,sepft,"Successful Exchange of Password for Access Token"
auth0,sercft,"Successful Exchange of Password and MFA Recovery Codeode for Access Token"
auth0,sertft,"Successful Exchange of Refresh Token for Access Token"
auth0,session_revoked,"Successfully revoked a session"
auth0,si,"Successfully accepted a user invitation"
auth0,slo,"Successful Logout"
auth0,srrt,"Successfully revoked a refresh token"
auth0,ss,"Successful Signup"
auth0,ssa,"Successful Silent Auth"
auth0,sui,"Successful Users Import"
auth0,sv,"Successfully consumed email verification link"
auth0,svr,"Successfully called verification email endpoint. Verification email has been queued for sending."
auth0,ublkdu,"User block setup by anomaly detection has been released"
auth0,w,"A warning has happened during a login flow"
`


export async function POST(req: Request) {
  const token = req.headers.get('token') ?? '';
  const userAIApiKey = req.headers.get('ai_key') ?? '';
  const { messages } = await req.json();
  console.log('token: ' + token)

  const anthropic = createAnthropic(
    { apiKey: apiKey ?? userAIApiKey },
  );

  const result = streamText({
    model: anthropic.languageModel('claude-3-5-sonnet-20240620'),
    maxSteps: 5,
    tools: {
      getAvailableDataSources: tool({
        description: 'Get available data sources. ' +
          'This returns the names of data sources that the user currently has data available.' +
          'Only the data sources returned by the this tools should be used in future tools to query data.' +
          'This tool must always be used before analysing data.',
        parameters: z.object({
          // token: z.string().describe('Tinybird Admin Token used to authenticate calls to the Tinybird API'),
        }),
        execute: async () => {
          const dataSources = await getInstalledDataSources(token);
          return dataSources;
        },
      }),
      queryDataSource: tool({
        description: 'Query a data source. ' +
          'This tool should be used to query data sources that the user has data available.' +
          'Only the data sources returned by the getAvailableDataSources tool should be used as sources of data for this tool.' +
          'This tool should generate Tinybird SQL queries, which are based on a subset of ClickHouse SQL.' +
          'Every query MUST follow these rules:' +
          '1. The query must be a valid Tinybird SQL query' +
          '2. The query must be a SELECT query' +
          '3. The query must be a single query' +
          '4. The query must be a single table' +
          '5. The query must not end with a semicolon (;)' +
          '6. The query must end with the text FORMAT JSON' +
          '7. The query must not contains new lines' +
          'The schema of all data sources is as follows: event_time DATETIME, event_type STRING, event JSON.' +
          'The event column contains a JSON object using the ClickHouse JSON type. The fields should be accessed using dot notation, e.g. event.data.field_name.' +
          'The event_type column contains the types of events. Here is a list of event types and their descriptions for every tool: \n' + event_type_context,
        parameters: z.object({
          // token: z.string().describe('Tinybird Admin Token used to authenticate calls to the Tinybird API'),
          query: z.string().describe('The SQL query to execute'),
          response: z.string().describe('An analysis of the data returned by the query which is shown to the user. The analysis must include the result of the query at the start.'),
        }),
        execute: async ({ query }) => {
          const response = await fetch(`/api/query?token=${token}&query=${encodeURIComponent(query)}`, {
            method: 'GET',
          });
          const data = await response.json();
          return data;
        },
      }),
    },
    system: 'You are the founder of a SaaS business. ' +
      'You want to understand your customers and their usage of your SaaS. ' +
      'Your product is built using various other SaaS products as building blocks. ' +
      'You have configured those SaaS products to push data to Tinybird. ' +
      'Tinybird is a data platform that allows you to query that data using SQL.' +
      'You can use the getAvailableDataSources tool to get the names of the data sources that you have available. ' +
      'You can use the queryDataSource tool to query the data sources that you have available. ',
    messages,
  });

  console.log(result);

  return result.toDataStreamResponse();
}