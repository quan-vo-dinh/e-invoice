import { getProcessId } from '@common/utils/string.util';
import { MetadataKey } from '@common/constants/common.constant';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ProcessId = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();

  return request[MetadataKey.PROCESSID] || getProcessId();
});
