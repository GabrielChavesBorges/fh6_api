import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Car {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100, unique: true })
  name: string;

  @Field(() => Manufacturer)
  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.cars, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Field(() => Int)
  @Column()
  manufacturerId: number;

  // engine
  // drivetrain
  // tires
  // suspension
  // brakes
  // aero
  // weight
  // power
  // PI

  // power curve
}
