import { Injectable, CanActivate, ExecutionContext, Inject, UnauthorizedException, Logger } from '@nestjs/common';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { MetadataKey } from '@common/constants/common.constant';
import { getAccessToken, setUserData } from '@common/utils/request.util';
import { getProcessId } from '@common/utils/string.util';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message';
import { AuthorizeResponse } from '@common/interfaces/tcp/authorizer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { GRPC_SERVICES } from '@common/configuration/grpc.config';
import { ClientGrpc } from '@nestjs/microservices';
import { AuthorizerService } from '@common/interfaces/grpc/authorizer/index';
@Injectable()
export class UserGuard implements CanActivate {
  private readonly logger = new Logger(UserGuard.name);
  private authorizerService: AuthorizerService;

  constructor(
    private readonly reflector: Reflector,
    @Inject(GRPC_SERVICES.AUTHORIZER_SERVICE) private readonly grpcAuthorizerClient: ClientGrpc,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.authorizerService = this.grpcAuthorizerClient.getService<AuthorizerService>('AuthorizerService');
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const authOptions = this.reflector.get<{ secured: boolean }>(MetadataKey.SECURED, context.getHandler());

    const req = context.switchToHttp().getRequest();

    if (!authOptions?.secured) {
      return true;
    }

    return this.verifyUserToken(req);
  }

  private async verifyUserToken(req: any): Promise<boolean> {
    try {
      const token = getAccessToken(req);
      const cacheKey = this.generateTokenCacheKey(token);

      const processId = req[MetadataKey.PROCESSID] || getProcessId('einvoice-app');
      const cacheData = await this.cacheManager.get<AuthorizeResponse>(cacheKey);

      if (cacheData) {
        setUserData(req, cacheData);
        return true;
      }
      req[MetadataKey.PROCESSID] = processId;

      const response = await firstValueFrom(
        this.authorizerService.verifyUserToken({
          processId,
          token,
        }),
      );
      this.logger.debug({ response });
      const { data: result } = response;

      if (!result?.valid) {
        throw new UnauthorizedException('Token is invalid');
      }
      this.logger.debug(`Set user data to cache for cache key: ${cacheKey}`);

      setUserData(req, result);
      this.cacheManager.set(cacheKey, result, 30 * 60 * 1000);

      return true;
    } catch (error) {
      this.logger.error({ error });
      throw new UnauthorizedException('Token is invalid');
    }
  }

  generateTokenCacheKey(token: string): string {
    const hash = createHash('sha256').update(token).digest('hex');
    return `user-token:${hash}`;
  }
}
