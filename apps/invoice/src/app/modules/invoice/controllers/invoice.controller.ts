import { Controller, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { RequestParams } from '@common/decorators/request-param.decorator';
import { InvoiceService } from '../services/invoice.service';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message';
import { CreateInvoiceTcpRequest, InvoiceTcpResponse } from '@common/interfaces/tcp/invoice';

@UseInterceptors(TcpLoggingInterceptor)
@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @MessagePattern(TCP_REQUEST_MESSAGE.INVOICE.CREATE)
  async create(@RequestParams() params: CreateInvoiceTcpRequest): Promise<Response<InvoiceTcpResponse>> {
    const result = await this.invoiceService.create(params);
    return Response.success<InvoiceTcpResponse>(result);
  }
}
