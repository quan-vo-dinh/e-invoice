import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Invoice, InvoiceModel, InvoiceModelName } from '@common/schemas/invoice.schema';
import { INVOICE_STATUS } from '@common/constants/enum/invoice.enum';

@Injectable()
export class InvoiceRepository {
  constructor(@InjectModel(InvoiceModelName) private readonly invoiceModel: InvoiceModel) {}

  create(data: Partial<Invoice>): Promise<Invoice> {
    return this.invoiceModel.create({
      ...data,
      status: INVOICE_STATUS.CREATED,
    });
  }
}
