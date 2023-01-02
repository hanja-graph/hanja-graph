import { QueryExecResult } from "sql.js";
export function queryDictionary(query: string): Promise<QueryExecResult[]>;
export function initializeDictionary(): Promise<void>;
