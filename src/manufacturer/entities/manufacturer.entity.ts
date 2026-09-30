import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Country } from '../../common/enums/country.enum';

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
  @Column({ length: 3 })
  country: Country;
}
