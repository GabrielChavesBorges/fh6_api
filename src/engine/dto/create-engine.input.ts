import { Field, InputType, Int } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Length, Min } from 'class-validator';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';

@InputType()
export class CreateEngineInput {
  @Field()
  @IsString()
  @Length(1, 100)
  name: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  displacementCc: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  cylinders: number | null;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  stockPowerHp: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  stockTorqueNm: number;

  @Field(() => EngineLayout)
  @IsEnum(EngineLayout)
  layout: EngineLayout;

  @Field({ defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isHybrid: boolean;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  manufacturerId: number;
}
