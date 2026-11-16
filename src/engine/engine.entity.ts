import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Car } from 'src/car/car.entity';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';

@ObjectType()
@Entity()
@Unique(['name', 'manufacturerId'])
export class Engine {
  @Field(() => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ length: 100 })
  name: string;

  @Field(() => Int, { nullable: true })
  @Column({ unsigned: true, nullable: true })
  displacementCc: number | null;

  @Field(() => Int, { nullable: true })
  @Column({ unsigned: true, nullable: true })
  cylinders: number | null;

  @Field(() => Int)
  @Column({ unsigned: true })
  stockPowerHp: number;

  @Field(() => Int)
  @Column({ unsigned: true })
  stockTorqueNm: number;

  @Field(() => EngineLayout)
  @Column({ type: 'enum', enum: EngineLayout })
  layout: EngineLayout;

  @Field()
  @Column({ default: false })
  isHybrid: boolean;

  @Field(() => Manufacturer)
  @ManyToOne(() => Manufacturer, (manufacturer) => manufacturer.engines, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'manufacturer_id' })
  manufacturer: Manufacturer;

  @Field(() => Int)
  @Column()
  manufacturerId: number;

  @Field(() => [Car])
  @OneToMany(() => Car, (car) => car.engine)
  cars: Car[];
}
