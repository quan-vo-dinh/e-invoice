import { ProductTcpResponse } from '@common/interfaces/tcp/product';
import { TCP_SERVICES } from '@common/configuration/tcp.config';
import { ResponseDto } from '@common/interfaces/gateway/response.interface';
import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProductResponseDto, CreateProductRequestDto } from '@common/interfaces/gateway/product';
import { TcpClient } from '@common/interfaces/tcp/common/tcp-client.interface';
import { TCP_REQUEST_MESSAGE } from '@common/constants/enum/tcp-request-message';
import { ProcessId } from '@common/decorators/processId.decorator';
import { map } from 'rxjs';
import { HTTP_MESSAGE } from '@common/constants/enum/http-message.enum';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(@Inject(TCP_SERVICES.PRODUCT_SERVICE) private readonly productClient: TcpClient) {}

  @Post()
  @ApiOkResponse({ type: ResponseDto<ProductResponseDto> })
  @ApiOperation({ summary: 'Create a new product' })
  create(@Body() body: CreateProductRequestDto, @ProcessId() processId: string) {
    //
    return this.productClient
      .send<ProductTcpResponse, CreateProductRequestDto>(TCP_REQUEST_MESSAGE.PRODUCT.CREATE, {
        data: body,
        processId,
      })
      .pipe(
        map(
          (response) =>
            new ResponseDto<ProductTcpResponse>({
              data: response.data,
              statusCode: response.statusCode,
              message: response.code as HTTP_MESSAGE,
            }),
        ),
      );
  }

  @Get()
  @ApiOkResponse({ type: ResponseDto<ProductResponseDto[]> })
  @ApiOperation({ summary: 'Get all products' })
  findAll(@ProcessId() processId: string) {
    return this.productClient
      .send<ProductTcpResponse[], void>(TCP_REQUEST_MESSAGE.PRODUCT.GET_LIST, { processId })
      .pipe(
        map(
          (response) =>
            new ResponseDto<ProductTcpResponse[]>({
              data: response.data,
              statusCode: response.statusCode,
              message: response.code as HTTP_MESSAGE,
            }),
        ),
      );
  }
}
