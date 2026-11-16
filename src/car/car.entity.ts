import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Engine } from 'src/engine/engine.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@ObjectType()
@Entity()
export class Car {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100, unique: true })
  name: string;

  @Field(() => Int)
  @Column()
  manufacturerId: number;

  @Field(() => Manufacturer)
  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.cars, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Field(() => Int)
  @Column()
  engineId: number;

  @Field(() => Engine)
  @ManyToOne(() => Engine, (engine) => engine.cars, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'engine_id' })
  engine: Engine;

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
