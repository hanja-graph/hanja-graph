interface QueryResponse {
  columns: Array<string>;
  values: Array<any>;
  error?: string | undefined;
}
export function queryDictionary(query: string): Promise<QueryResponse>;
export function exportDatabase(): Promise<string>;
