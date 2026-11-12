import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, Length } from 'class-validator';

@InputType()
export class CreateCarInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name: string;

  @Field(() => Int)
  @IsInt()
  manufacturerId: number;
}
