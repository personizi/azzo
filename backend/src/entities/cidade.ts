import { Entity, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { Cliente } from './cliente';
import { Usuario } from './usuario';
import { Estado } from './estado';

@Entity('cidade')
@Unique(['nome', 'estado'])
export class Cidade {
  @PrimaryGeneratedColumn('increment')
  cidade_id: number;

  @Column({ type: 'varchar', length: 45 })
  nome: string;

  @OneToMany(() => Cliente, (cliente) => cliente.cidade)
  clientes: Cliente[];

  @OneToMany(() => Usuario, (usuario) => usuario.cidade)
  usuarios: Usuario[];

  @ManyToOne(() => Estado, (estado) => estado.cidades)
  @JoinColumn({ name: 'estado_id' })
  estado: Estado;
}
