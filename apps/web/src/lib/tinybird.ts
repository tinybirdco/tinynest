/* eslint-disable  @typescript-eslint/no-explicit-any */

import { type ToolState } from './constants';

export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token');
    this.name = 'InvalidTokenError';
  }
}

export interface TinybirdDataSource {
  name: string;
  description?: string;
  schema: Array<{
    name: string;
    type: string;
  }>;
}

export async function listDataSources(token: string): Promise<TinybirdDataSource[]> {
  const response = await fetch(`/api/datasources?token=${token}`);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new InvalidTokenError();
    }
    throw new Error('Failed to fetch data sources');
  }

  const data = await response.json();
  if (!data?.datasources) {
    throw new InvalidTokenError();
  }
  return data.datasources;
}

export interface QueryResult {
  meta: Array<{ name: string; type: string }>;
  data: Array<Record<string, any>>;
  rows: number;
  statistics: {
    elapsed: number;
    rows_read: number;
    bytes_read: number;
  };
}

export async function query(token: string, sql: string): Promise<QueryResult> {
  const response = await fetch(`/api/query?token=${token}&query=${encodeURIComponent(sql)}`);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new InvalidTokenError();
    }
    throw new Error('Failed to execute query');
  }

  const data = await response.json();
  return data;
}

export async function checkToolState(token: string, datasource: string): Promise<ToolState> {
  try {
    // First check if data source exists
    const sources = await listDataSources(token);
    const exists = sources.some(source => source.name === datasource);
    
    if (!exists) {
      return 'available';
    }

    // Then check if it has data
    const result = await query(token, `SELECT count(*) as count FROM ${datasource} FORMAT JSON`);
    const hasData = result.data[0]?.count > 0;

    return hasData ? 'configured' : 'installed';
  } catch (error) {
    if (error instanceof InvalidTokenError) {
      throw error;
    }
    console.error('Error checking tool state:', error);
    return 'available';
  }
}

export async function pipe<T = QueryResult>(
  token: string, 
  pipeName: string, 
  params?: Record<string, string | number | boolean>
): Promise<T> {
  const searchParams = new URLSearchParams({ token, pipe: pipeName });
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
  }

  const response = await fetch(`/api/pipes?${searchParams}`);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new InvalidTokenError();
    }
    throw new Error('Failed to execute pipe');
  }

  const data = await response.json();
  return data;
}
