import { ArrayNotEmpty, IsArray, IsEmail, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ClientRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  address: string;
}

class ItemRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  unitPrice: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  vatRate: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  total: number;
}

export class CreateInvoiceRequestDto {
  @ApiProperty({ type: ClientRequestDto })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ClientRequestDto)
  client: ClientRequestDto;

  @ApiProperty({ type: [ItemRequestDto] })
  @ArrayNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRequestDto)
  items: ItemRequestDto[];
}
