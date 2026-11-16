import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Country } from 'src/common/enums/country.enum';
import { Car } from 'src/car/car.entity';
import { Engine } from 'src/engine/engine.entity';

@ObjectType()
@Entity()
export class Manufacturer {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100, unique: true })
  name: string;

  @Field(() => Country)
  @Column({ type: 'enum', enum: Country })
  country: Country;

  @Field(() => [Car])
  @OneToMany(() => Car, (car) => car.manufacturer)
  cars: Car[];

  @Field(() => [Engine])
  @OneToMany(() => Engine, (engine) => engine.manufacturer)
  engines: Engine[];
}
