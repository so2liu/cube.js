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

  public async addToQueue(keyScore: number, queryKey: string, orphanedTime: any, queryHandler: string, query: AddToQueueQuery, priority: number, options: AddToQueueOptions): Promise<unknown> {
    console.log('addtoQueue ..', {
      keyScore, queryKey, orphanedTime, queryHandler, query, priority, options
    });

    // throw new Error('Unimplemented addToQueue');

    const data = {
      queryHandler,
      query,
      queryKey,
      stageQueryKey: options.stageQueryKey,
      priority,
      requestId: options.requestId,
      addedToQueueTime: new Date().getTime()
    };

    console.log('addtoQueue data', data);

    const rows = await this.driver.query(`QUEUE ADD PRIORITY ${priority} "${queryKey}" "${JSON.stringify(data)}"`, []);

    return [
      1,
      null,
      null,
      1,
      data.addedToQueueTime
    ];
  }

  public async getQueryAndRemove(queryKey: string): Promise<unknown> {
    throw new Error('Unimplemented getQueryAndRemove');
  }

  public async cancelQuery(queryKey: string): Promise<unknown> {
    throw new Error('Unimplemented cancelQuery');
  }

  public async freeProcessingLock(queryKe: string, processingId: string, activated: unknown): Promise<unknown> {
    throw new Error('Unimplemented freeProcessingLock');
  }

  public async getActiveQueries(): Promise<unknown> {
    throw new Error('Unimplemented getActiveQueries');
  }

  public async getNextProcessingId(): Promise<string> {
    throw new Error('Unimplemented getNextProcessingId');
  }

  public async getOrphanedQueries(): Promise<unknown> {
    // throw new Error('Unimplemented getOrphanedQueries');

    console.log('getOrphanedQueries');

    return [];
  }

  public async getQueryStageState(onlyKeys: boolean): Promise<QueryStageStateResponse> {
    console.log(onlyKeys);
    // throw new Error(`Unimplemented getQueryStageState, onlyKeys: ${onlyKeys}`);

    return <any>[[], [], []];
  }

  public async getResult(queryKey: string): Promise<unknown> {
    // throw new Error(`Unimplemented getResult, queryKey: ${queryKey}`);

    return null;
  }

  public async getResultBlocking(queryKey: string): Promise<unknown> {
    throw new Error(`Unimplemented getResultBlocking, queryKey: ${queryKey}`);
  }

  public async getStalledQueries(): Promise<unknown> {
    // throw new Error('Unimplemented getStalledQueries');

    console.log('getStalledQueries');

    return [];
  }

  public async getToProcessQueries(): Promise<unknown> {
    throw new Error('Unimplemented getToProcessQueries');
  }

  public async optimisticQueryUpdate(queryKey: any, toUpdate: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented optimisticQueryUpdate');
  }

  public async release(): Promise<void> {
    // throw new Error('Unimplemented release');
  }

  public async retrieveForProcessing(queryKey: string, processingId: string): Promise<unknown> {
    throw new Error('Unimplemented retrieveForProcessing');
  }

  public async setResultAndRemoveQuery(queryKey: string, executionResult: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented setResultAndRemoveQuery');
  }

  public async updateHeartBeat(queryKey: string): Promise<void> {
    throw new Error('Unimplemented updateHeartBeat');
  }
}

interface QueueDriverOptions {

}

export class CubeStoreQueueDriver implements QueueDriverInterface {
  public constructor(
    protected readonly driver: CubeStoreDriver,
    protected readonly options: QueueDriverOptions
  ) {}

  public async createConnection(): Promise<CubestoreQueueDriverConnection> {
    return new CubestoreQueueDriverConnection(this.driver);
  }

  public async release(connection: CubestoreQueueDriverConnection): Promise<void> {
    // nothing to release
  }
}
