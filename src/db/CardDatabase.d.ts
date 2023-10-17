interface QueryResponse {
  columns: Array<string>;
  values: Array<any>;
  error?: string | undefined;
  query?: string | undefined;
}
export function queryDictionary(query: string): Promise<QueryResponse>;
export function exportDatabase(): Promise<ArrayBuffer>;
export function importDatabase(dbData: ArrayBuffer): Promise<void>;
