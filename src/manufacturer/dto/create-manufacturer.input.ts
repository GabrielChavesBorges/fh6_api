import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsString, Length } from 'class-validator';
import { Country } from 'src/common/enums/country.enum';

@InputType()
export class CreateManufacturerInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name: string;

  @Field(() => Country)
  @IsEnum(Country)
  country: Country;
}
