import { Regiao } from 'src/infrastructure/database/entities';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cidade, Cliente } from '../../../infrastructure/database/entities';
import { CustomerAPIResponse } from '../dto/customers.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CustomersService {
  private readonly apiUrl = 'https://app.pedidosdigitais.com.br/api/v2/stores?page=3';
  private readonly token: string;

  constructor(
    @InjectRepository(Cliente) private readonly clienteRepository: Repository<Cliente>,
    @InjectRepository(Cidade) private readonly cidadeRepository: Repository<Cidade>,
    @InjectRepository(Regiao) private readonly regiaoRepository: Repository<Regiao>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.token = this.configService.get<string>('SELLENTT_API_TOKEN');
  }

  async syncroCostumers(): Promise<void> {
    try {
      const response = await this.httpService.axiosRef.get<{ data: CustomerAPIResponse[] }>(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const clientesData = response.data.data;
      console.log('Clientes recebidos =>', clientesData);
      for (const client of clientesData) {
        await this.processarCliente(client);
      }
    } catch (error) {
      console.error('Erro ao sincronizar clientes:', error);
      throw error;
    }
  }

  private async processarCliente(client: CustomerAPIResponse) {
    const cidade = await this.cidadeRepository.findOne({
      where: { nome: client.address_city },
      relations: ['estado'],
    });
    const regiao = await this.regiaoRepository.findOne({
      where: { regiao_id: client.region_code },
    });

    const novoCliente = this.clienteRepository.create({
      nome: client.name,
      codigo: client.code,
      nome_empresa: client.company_name,
      tipo_doc: client.doc_type,
      numero_doc: client.doc_number,
      ie: client.reg_number,
      endereco: client.address_street,
      num_endereco: client.address_number,
      complemento: client.address_more,
      cep: client.address_zipcode,
      bairro: client.address_district,
      cidade_string: client.address_city,
      cidade: cidade || null,
      email: client.email_1.toLowerCase(),
      celular: client.phone_number_1,
      telefone_comercial: client.phone_number_2,
      ativo: client.is_active,
      regiao: regiao,
      data_criacao: new Date(client.created_at),
      data_atualizacao: new Date(client.updated_at),
    });

    await this.clienteRepository.save(novoCliente);
    console.log(`Cliente ${novoCliente.nome} salvo com sucesso!`);
  }

  findAllCostumers(): Promise<Cliente[]> {
    return this.clienteRepository.find({ relations: ['cidade.estado'] });
  }

  findCostumerByCode(codigo: number): Promise<Cliente> {
    return this.clienteRepository.findOne({ where: { codigo }, relations: ['cidade.estado'] });
  }
}