import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateCarInput } from './create-car.input';

@InputType()
export class UpdateCarInput extends PartialType(CreateCarInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
