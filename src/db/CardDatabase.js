import { initOPFSWorker, getOPFSQueryFunctions } from "./OPFSQueryProvider";
import {
  createOrGetDatabase,
  getKVVFSQueryFunctions,
} from "./KVVFSQueryProvider";

let dbProviderSingleton = undefined;

const initializeQueryProvider = async () => {
  if (dbProviderSingleton) {
    return dbProviderSingleton;
  }
  const opfsWorker = await initOPFSWorker();
  if (opfsWorker) {
    dbProviderSingleton = getOPFSQueryFunctions();
    console.log("Initialized OPFS query provider.");
    return dbProviderSingleton;
  } else {
    console.log("Failed to initialize OPFS query provider, trying KVVFS");
  }
  const kvfsDatabase = await createOrGetDatabase();
  if (!kvfsDatabase) {
    throw new Error(
      "Could not initialize any query provider, so cannot provide access to a card database."
    );
  }
  dbProviderSingleton = getKVVFSQueryFunctions();
  console.log("Initialized LVVFS query provider.");
  return dbProviderSingleton;
};

export const queryDictionary = async (query) => {
  const dbProvider = await initializeQueryProvider();
  return await dbProvider.queryDB(query);
};

export const exportDatabase = async () => {
  const opfsInitResponse = await initOPFSWorker();
  if (!opfsInitResponse.initSucceeded) {
    console.log("init failed");
  }
  console.log(opfsInitResponse);
  const q = "SELECT * FROM hanjas LIMIT 2;";
  const res = await queryDictionary(q);
  console.log(res);
};
