import {
  QueueDriverInterface,
  LocalQueueDriverConnectionInterface,
  QueryStageStateResponse,
} from '@cubejs-backend/base-driver';

import { CubeStoreDriver } from './CubeStoreDriver';

interface AddToQueueQuery {
  isJob: boolean,
  orphanedTimeout: unknown
}

interface AddToQueueOptions {
  stageQueryKey: string,
  requestId: string
}

class CubestoreQueueDriverConnection implements LocalQueueDriverConnectionInterface {
  public constructor(
    protected readonly driver: CubeStoreDriver
  ) {}

  public async addToQueue(keyScore: number, queryKey: any[], orphanedTime: any, queryHandler: string, query: AddToQueueQuery, priority: number, options: AddToQueueOptions): Promise<unknown> {
    console.log('addtoQueue', {
      keyScore, queryKey, orphanedTime, queryHandler, query, priority, options
    });

    throw new Error('Unimplemented addToQueue');
  }

  cancelQuery(queryKey: string): Promise<unknown> {
    throw new Error('Unimplemented cancelQuery');
  }

  freeProcessingLock(queryKe: string, processingId: string, activated: unknown): Promise<unknown> {
    throw new Error('Unimplemented freeProcessingLock');
  }

  getActiveQueries(): Promise<unknown> {
    throw new Error('Unimplemented getActiveQueries');
  }

  getNextProcessingId(): Promise<string> {
    throw new Error('Unimplemented getNextProcessingId');
  }

  getOrphanedQueries(): Promise<unknown> {
    throw new Error('Unimplemented getOrphanedQueries');
  }

  getQueryStageState(onlyKeys: boolean): Promise<QueryStageStateResponse> {
    console.log(onlyKeys);
    // throw new Error(`Unimplemented getQueryStageState, onlyKeys: ${onlyKeys}`);

    return <any>[[], [], []];
  }

  public async getResult(queryKey: string): Promise<unknown> {
    // throw new Error(`Unimplemented getResult, queryKey: ${queryKey}`);

    return null;
  }

  getResultBlocking(queryKey: string): Promise<unknown> {
    throw new Error(`Unimplemented getResultBlocking, queryKey: ${queryKey}`);
  }

  getStalledQueries(): Promise<unknown> {
    throw new Error('Unimplemented getStalledQueries');
  }

  getToProcessQueries(): Promise<unknown> {
    throw new Error('Unimplemented getToProcessQueries');
  }

  optimisticQueryUpdate(queryKey: any, toUpdate: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented optimisticQueryUpdate');
  }

  release(): Promise<void> {
    throw new Error('Unimplemented release');
  }

  retrieveForProcessing(queryKey: string, processingId: string): Promise<unknown> {
    throw new Error('Unimplemented retrieveForProcessing');
  }

  setResultAndRemoveQuery(queryKey: string, executionResult: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented setResultAndRemoveQuery');
  }

  updateHeartBeat(queryKey: string): Promise<void> {
    throw new Error('Unimplemented updateHeartBeat');
  }
}

export class CubeStoreQueueDriver implements QueueDriverInterface {
  public constructor(
    protected readonly driver: CubeStoreDriver
  ) {}

  public async createConnection(): Promise<CubestoreQueueDriverConnection> {
    return new CubestoreQueueDriverConnection(this.driver);
  }

  public async release(connection: CubestoreQueueDriverConnection): Promise<void> {
    // nothing to release
  }
}
