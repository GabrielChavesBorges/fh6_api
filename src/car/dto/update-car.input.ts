import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt } from 'class-validator';
import { CreateCarInput } from './create-car.input';
import { IsNotExplicitNull } from 'src/common/validation/is-not-explicit-null.decorator';

@InputType()
export class UpdateCarInput extends PartialType(CreateCarInput) {
  @Field(() => Int)
  @IsInt()
  id: number;

  @IsNotExplicitNull()
  name?: string;

  @IsNotExplicitNull()
  manufacturerId?: number;
}
