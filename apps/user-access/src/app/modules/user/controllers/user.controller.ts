import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { Controller, UseInterceptors } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { MessagePattern } from '@nestjs/microservices';
import { RequestParams } from '@common/decorators/request-param.decorator';
import { CreateUserTcpRequest } from '@common/interfaces/tcp/user';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';
import { ProcessId } from '@common/decorators/processId.decorator';
@Controller('users')
@UseInterceptors(TcpLoggingInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.USER.CREATE)
  async create(@RequestParams() data: CreateUserTcpRequest, @ProcessId() processId: string): Promise<Response<string>> {
    await this.userService.create(data, processId);

    return Response.success<string>(HTTP_MESSAGE.CREATED);
  }
}
