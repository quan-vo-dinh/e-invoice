import { MetadataKey } from '@common/constants/common.constant';
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthorizedMetadata, AuthorizeResponse } from '@common/interfaces/tcp/authorizer';

export const UserData = createParamDecorator((_: unknown, ctx: ExecutionContext): AuthorizedMetadata => {
  const request = ctx.switchToHttp().getRequest();

  const userData = request[MetadataKey.USER_DATA] as AuthorizeResponse;

  if (!userData) {
    throw new UnauthorizedException('User data not found');
  }

  return userData?.metadata;
});
