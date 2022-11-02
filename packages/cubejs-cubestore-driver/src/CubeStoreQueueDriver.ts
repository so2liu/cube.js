import {
  QueueDriverInterface,
  LocalQueueDriverConnectionInterface,
  QueryStageStateResponse, QueryDef, RetrieveForProcessingResponse,
} from '@cubejs-backend/base-driver';

import { CubeStoreDriver } from './CubeStoreDriver';
import crypto from 'crypto';

interface AddToQueueQuery {
  isJob: boolean,
  orphanedTimeout: unknown
}

interface AddToQueueOptions {
  stageQueryKey: string,
  requestId: string
}

interface QueueDriverOptions {
  redisQueuePrefix: string,
  concurrency: number,
}

class CubestoreQueueDriverConnection implements LocalQueueDriverConnectionInterface {
  public constructor(
    protected readonly driver: CubeStoreDriver,
    protected readonly options: QueueDriverOptions,
  ) {
  }

  protected getKey(suffix: string, queryKey?: string): string {
    if (queryKey) {
      return `${suffix}:${this.options.redisQueuePrefix}:${this.redisHash(queryKey)}`;
    } else {
      return `${suffix}:${this.options.redisQueuePrefix}`;
    }
  }

  public redisHash(queryKey) {
    return typeof queryKey === 'string' && queryKey.length < 256 ?
      queryKey :
      crypto.createHash('md5').update(JSON.stringify(queryKey)).digest('hex');
  }

  public async addToQueue(keyScore: number, queryKey: string, orphanedTime: any, queryHandler: string, query: AddToQueueQuery, priority: number, options: AddToQueueOptions): Promise<unknown> {
    console.log('addtoQueue ..', {
      keyScore, queryKey, orphanedTime, queryHandler, query, priority, options
    });

    // TODO: Fix sqlparser, support negative number
    priority = priority < 0 ? 0 : priority;

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

    const rows = await this.driver.query(`QUEUE ADD PRIORITY ? ? ?`, [
      priority,
      this.redisHash(queryKey),
      JSON.stringify(data)
    ]);

    return [
      1,
      null,
      null,
      1,
      data.addedToQueueTime
    ];
  }

  // TODO: Looks useless, because we can do it in one step - getQueriesToCancel
  public async getQueryAndRemove(queryKey: string): Promise<[QueryDef]> {
    return this.cancelQuery(queryKey);
  }

  public async cancelQuery(queryKey: string): Promise<[QueryDef]> {
    const rows = await this.driver.query('QUEUE CANCEL ?', [
      this.redisHash(queryKey)
    ]);
    if (rows && rows.length) {
      return [JSON.parse(rows[0].value)];
    }

    throw new Error(`Unable to cancel query with id: "${queryKey}"`);
  }

  public async freeProcessingLock(queryKey: string, processingId: string, activated: unknown): Promise<unknown> {
    throw new Error('Unimplemented freeProcessingLock');
  }

  public async getActiveQueries(): Promise<unknown> {
    const rows = await this.driver.query('select id from system.queue where status = ?', ['Active']);
    return rows.map((row) => row.id);
  }

  public async getNextProcessingId(): Promise<number | string> {
    const rows = await this.driver.query('CACHE INCR ?', [
      this.getKey('PROCESSING_COUNTER')
    ]);
    if (rows && rows.length) {
      return rows[0].value;
    }

    throw new Error('Unable to get next processing id');
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

  public async getStalledQueries(): Promise<string[]> {
    const rows = await this.driver.query('select id from from system.queue WHERE created <= DATE_SUB(NOW(), interval \'1 minute\') AND status = ?', ['Pending']);
    return rows.map((row) => row.id);
  }

  public async getOrphanedQueries(): Promise<string[]> {
    return [];
  }

  public async getQueriesToCancel(): Promise<string[]> {
    // TODO: It's better to introduce single command which cancel all orhaped & stalled queries and return it back
    const rows = await this.driver.query('select id from system.queue WHERE created <= DATE_SUB(NOW(), interval \'1 minute\') AND status = ?', ['Pending']);
    return rows.map((row) => row.id);
  }

  public async getQueryDef(queryKey: string): Promise<QueryDef> {
    const rows = await this.driver.query('select value from system.queue where id = ?', [this.redisHash(queryKey)]);
    if (rows && rows.length) {
      return JSON.parse(rows[0].value);
    }

    throw new Error(`Unable to find query def for id: "${queryKey}"`);
  }

  public async getToProcessQueries(): Promise<string[]> {
    const rows = await this.driver.query('select id from system.queue where status = ?', ['Pending']);
    return rows.map((row) => row.id);
  }

  public async optimisticQueryUpdate(queryKey: any, toUpdate: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented optimisticQueryUpdate');
  }

  public async release(): Promise<void> {
    // throw new Error('Unimplemented release');
  }

  public async retrieveForProcessing(queryKey: string, processingId: string): Promise<RetrieveForProcessingResponse> {
    throw new Error('Unimplemented retrieveForProcessing');
  }

  public async setResultAndRemoveQuery(queryKey: string, executionResult: any, processingId: any): Promise<unknown> {
    throw new Error('Unimplemented setResultAndRemoveQuery');
  }

  public async updateHeartBeat(queryKey: string): Promise<void> {
    await this.driver.query('QUEUE HEARTBEAT ?', [
      this.redisHash(queryKey)
    ]);
  }
}

export class CubeStoreQueueDriver implements QueueDriverInterface {
  public constructor(
    protected readonly driver: CubeStoreDriver,
    protected readonly options: QueueDriverOptions
  ) {}

  public async createConnection(): Promise<CubestoreQueueDriverConnection> {
    return new CubestoreQueueDriverConnection(this.driver, this.options);
  }

  public async release(connection: CubestoreQueueDriverConnection): Promise<void> {
    // nothing to release
  }
}
