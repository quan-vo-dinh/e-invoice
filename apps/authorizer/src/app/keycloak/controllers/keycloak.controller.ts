import { Controller, UseInterceptors } from '@nestjs/common';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { KeycloakHttpService } from '../services/keycloak-http.service';
import { MessagePattern } from '@nestjs/microservices';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message';
import { RequestParams } from '@common/decorators/request-param.decorator';
import { CreateKeyCloakUserTcpRequest } from '@common/interfaces/tcp/authorizer';
import { Response } from '@common/interfaces/tcp/common/response.interface';

@Controller()
@UseInterceptors(TcpLoggingInterceptor)
export class KeycloakController {
  constructor(private readonly keycloakHttpService: KeycloakHttpService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.KEYCLOAK.CREATE_USER)
  async createUser(@RequestParams() data: CreateKeyCloakUserTcpRequest): Promise<Response<string>> {
    const result = await this.keycloakHttpService.createUser(data);
    return Response.success<string>(result);
  }
}
