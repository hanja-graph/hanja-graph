import { initOPFSWorker, queryOPFSWorker } from "./OPFSQueryProvider";
import { createOrGetDatabase, queryKVVFSDatabase } from "./KVVFSQueryProvider";

let queryProviderSingleton = undefined;

const initializeDictionary = async () => {
  if (queryProviderSingleton) {
    return queryProviderSingleton;
  }
  const opfsWorker = await initOPFSWorker();
  if (opfsWorker) {
    queryProviderSingleton = queryOPFSWorker;
    console.log("Initialized OPFS query provider.");
    return queryProviderSingleton;
  } else {
    console.log("Failed to initialize OPFS query provider, trying KVVFS");
  }
  const kvfsDatabase = await createOrGetDatabase();
  if (!kvfsDatabase) {
    throw new Error(
      "Could not initialize any query provider, so cannot provide access to a card database."
    );
  }
  queryProviderSingleton = queryKVVFSDatabase;
  console.log("Initialized LVVFS query provider.");
  return queryProviderSingleton;
};

export const queryDictionary = async (query) => {
  const queryProvider = await initializeDictionary();
  return await queryProvider(query);
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
