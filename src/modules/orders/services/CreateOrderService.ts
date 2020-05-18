import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';

interface IProduct {
  id: string;
  quantity: number;
}

interface IProductRes {
  product_id: string;
  price: number;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateProductService {
  constructor(
    @inject('CustomersRepository')
    private ordersRepository: IOrdersRepository,

    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,

    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError('Usuário não encontrado');
    }
    const productsArr: IProductRes[] = [];

    products.forEach(async product => {
      const qnt = product.quantity;
      const { id, price, quantity } = await this.productsRepository.findById(
        product.id,
      );
      if (!id) {
        throw new AppError('Produto não encontrado');
      }
      if (qnt > quantity) {
        throw new AppError('Produto não tem estoque suficiente');
      }
      Object.assign(product, {
        product_id: id,
        price,
        quantity: product.quantity,
      });
      products.push(product);
    });
    const order = await this.ordersRepository.create({
      customer,
      products: productsArr,
    });
    return order;
  }
}

export default CreateProductService;
