import { InputType, Int, Field } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @Length(1, 31)
  name: string;
}
