export type QueryStageStateResponse = any[];
export type QueryDef = unknown;
export type RetrieveForProcessingResponse = [added: any, removed: any, active: string[], toProcess: any, def: QueryDef, lockAquired: boolean] | null;
export interface AddToQueueQuery {
  isJob: boolean,
  orphanedTimeout: unknown
}

export interface AddToQueueOptions {
  stageQueryKey: string,
  requestId: string
}

export interface QueueDriverOptions {
  redisQueuePrefix: string,
  concurrency: number,
  continueWaitTimeout: number,
}

export interface LocalQueueDriverConnectionInterface {
  getResultBlocking(queryKey: string): Promise<unknown>;
  getResult(queryKey: string): Promise<any>;
  addToQueue(keyScore: number, queryKey: string, orphanedTime: any, queryHandler: any, query: any, priority: any, options: any): Promise<unknown>;
  getToProcessQueries(): Promise<unknown>;
  getActiveQueries(): Promise<unknown>;
  getQueryDef(queryKey: string): Promise<QueryDef>;
  getOrphanedQueries(): Promise<unknown>;
  getStalledQueries(): Promise<unknown>;
  getQueryStageState(onlyKeys: boolean): Promise<QueryStageStateResponse>;
  updateHeartBeat(queryKey: string): Promise<void>;
  getNextProcessingId(): Promise<string | number>;
  retrieveForProcessing(queryKey: string, processingId: number | string): Promise<RetrieveForProcessingResponse>;
  freeProcessingLock(queryKe: string, processingId: string | number, activated: unknown): Promise<void>;
  optimisticQueryUpdate(queryKey, toUpdate, processingId): Promise<boolean>;
  cancelQuery(queryKey: string): Promise<[QueryDef]>;
  getQueryAndRemove(queryKey: string): Promise<[QueryDef]>;
  setResultAndRemoveQuery(queryKey: string, executionResult: any, processingId: any): Promise<unknown>;
  release(): void;
  //
  getQueriesToCancel(): Promise<string[]>
}

export interface QueueDriverInterface {
  createConnection(): Promise<LocalQueueDriverConnectionInterface>;
  release(connection: LocalQueueDriverConnectionInterface): void;
}
