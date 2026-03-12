import { parseToken } from './string.util';
import { AuthorizeResponse } from '@common/interfaces/tcp/authorizer';
import { MetadataKey } from '@common/constants/common.constant';

export function getAccessToken(req: any, keepBearer = false): string {
  const token = req.headers?.['authorization'] || '';

  return keepBearer ? token : parseToken(token);
}

export function setUserData(req: any, userData?: AuthorizeResponse): void {
  req[MetadataKey.USER_DATA] = userData;
}
