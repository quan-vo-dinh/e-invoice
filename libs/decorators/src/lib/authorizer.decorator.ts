import { applyDecorators, SetMetadata } from '@nestjs/common';
import { MetadataKey } from '@common/constants/common.constant';
import { ApiBearerAuth } from '@nestjs/swagger';

export const Authorization = ({ secured = false }: { secured?: boolean }) => {
  const setMetadata = SetMetadata(MetadataKey.SECURED, {
    secured,
  });
  if (secured) {
    const decorators = [ApiBearerAuth()];
    return applyDecorators(...decorators, setMetadata);
  }
  return setMetadata;
};
