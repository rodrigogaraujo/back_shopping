import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import Customer from '../infra/typeorm/entities/Customer';
import ICustomersRepository from '../repositories/ICustomersRepository';

interface IRequest {
  name: string;
  email: string;
}

@injectable()
class CreateCustomerService {
  constructor(
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ name, email }: IRequest): Promise<Customer> {
    const customerEmail = await this.customersRepository.findByEmail(email);

    if (!customerEmail) {
      throw new AppError('Email já cadastrado');
    }

    const customer = await this.customersRepository.create({ name, email });
    if (!customer) {
      throw new AppError('Erro ao cadastrar um novo cliente');
    }
    return customer;
  }
}

export default CreateCustomerService;
