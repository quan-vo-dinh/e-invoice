import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseResponseDto } from '../common/base-response.dto';
import { INVOICE_STATUS } from '@common/constants/enum/invoice.enum';

class ClientResponseDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  address: string;
}

class ItemResponseDto {
  @ApiProperty()
  productId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  vatRate: number;

  @ApiProperty()
  total: number;
}

export class InvoiceResponseDto extends BaseResponseDto {
  @ApiProperty({ type: ClientResponseDto })
  client: ClientResponseDto;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  vatAmount: number;

  @ApiProperty({ enum: INVOICE_STATUS, type: String })
  status: INVOICE_STATUS;

  @ApiProperty({ type: [ItemResponseDto] })
  items: ItemResponseDto[];

  @ApiPropertyOptional()
  supervisorId?: string;

  @ApiPropertyOptional()
  fileUrl?: string;
}
