import { Product } from '@common/entities/product.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
  constructor(@InjectRepository(Product) private readonly repo: Repository<Product>) {}

  create(data: Partial<Product>): Promise<Product> {
    // Tạo một instance mới của Product với dữ liệu đã cho, chỉ tạo object trong bộ nhớ, chưa lưu vào database
    const product = this.repo.create(data);
    return this.repo.save(product);
  }

  findAll(): Promise<Product[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Product> {
    return this.repo.findOne({ where: { id } });
  }

  update(id: string, data: Partial<Product>): Promise<Product> {
    return this.repo.save({ id, ...data });
  }

  delete(id: string): Promise<void> {
    return this.repo.delete(id).then(() => undefined);
  }

  async exists(sku: string, name: string): Promise<boolean> {
    const count = await this.repo.count({ where: [{ sku }, { name }] });
    return count > 0;
  }
}
