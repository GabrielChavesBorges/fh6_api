import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { IsInt, Min } from 'class-validator';
import { IsNotExplicitNull } from 'src/common/decorators/is-not-explicit-null';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { CreateEngineInput } from './create-engine.input';

@InputType()
export class UpdateEngineInput extends PartialType(CreateEngineInput, { omitDefaultValues: true }) {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  id: number;

  @IsNotExplicitNull()
  name?: string;

  @IsNotExplicitNull()
  stockPowerHp?: number;

  @IsNotExplicitNull()
  stockTorqueNm?: number;

  @IsNotExplicitNull()
  layout?: EngineLayout;

  @IsNotExplicitNull()
  isHybrid?: boolean;

  @IsNotExplicitNull()
  manufacturerId?: number;
}
