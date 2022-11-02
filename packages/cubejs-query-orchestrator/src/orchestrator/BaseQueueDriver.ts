import crypto from 'crypto';
import {
  LocalQueueDriverConnectionInterface,
  QueueDriverInterface,
} from '@cubejs-backend/base-driver';

function queryKeyHash(queryKey: string): string {
  return typeof queryKey === 'string' && queryKey.length < 256 ?
    queryKey :
    crypto.createHash('md5').update(JSON.stringify(queryKey)).digest('hex');
}

export abstract class BaseQueueDriver implements QueueDriverInterface {
  public redisHash(queryKey: string) {
    return queryKeyHash(queryKey);
  }

  abstract createConnection(): Promise<LocalQueueDriverConnectionInterface>;

  abstract release(connection: LocalQueueDriverConnectionInterface): Promise<void>;
}
