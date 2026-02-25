import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { TcpLoggingInterceptor } from '@common/interceptors/tcpLogging.interceptor';
import { Response } from '@common/interfaces/tcp/common/response.interface';
import { Request } from '@common/interfaces/tcp/common/request.interface';
import { ProcessId } from '@common/decorators/processId.decorator';
import { RequestParam } from '@common/decorators/request-param.decorator';
import { InvoiceService } from '../services/invoice.service';

@UseInterceptors(TcpLoggingInterceptor)
@Controller()
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Get()
  getData() {
    return this.invoiceService.getData();
  }

  @MessagePattern('get_invoice')
  getInvoice(@ProcessId() processId: string, @RequestParam() invoiceId: Request<number>): Response<string> {
    return Response.success<string>(`Invoice Data for ID: ${processId}, Params: ${JSON.stringify(invoiceId)}`);
  }
}
