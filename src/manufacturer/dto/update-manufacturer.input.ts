import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateManufacturerInput } from './create-manufacturer.input';

@InputType()
export class UpdateManufacturerInput extends PartialType(CreateManufacturerInput) {
  @Field(() => Int)
  @IsInt()
  id: number;
}
