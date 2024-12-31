import { anthropic } from '@ai-sdk/anthropic';
import { streamText, tool } from 'ai';
import { getInstalledDataSources } from '@/lib/tinybird';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const token = req.headers.get('token') ?? '';
  const { messages } = await req.json();
  console.log('token: ' + token)

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-latest'),
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
          'The event column contains a JSON object using the ClickHouse JSON type. The fields should be accessed using dot notation, e.g. event.data.field_name.',
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