import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CreateEngineInput } from './dto/create-engine.input';
import { UpdateEngineInput } from './dto/update-engine.input';
import { Engine } from './engine.entity';
import { EngineService } from './engine.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';

@Resolver(() => Engine)
export class EngineResolver {
  constructor(
    private readonly engineService: EngineService,
    private readonly manufacturerService: ManufacturerService,
  ) {}

  @Mutation(() => Engine)
  createEngine(
    @Args('createEngineInput')
    createEngineInput: CreateEngineInput,
  ) {
    return this.engineService.create(createEngineInput);
  }

  @Query(() => [Engine], { name: 'engines' })
  findAll() {
    return this.engineService.findAll();
  }

  @Query(() => Engine, { name: 'engine' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.engineService.findOne(id);
  }

  @Mutation(() => Engine)
  updateEngine(
    @Args('updateEngineInput')
    updateEngineInput: UpdateEngineInput,
  ) {
    return this.engineService.update(updateEngineInput);
  }

  @Mutation(() => Boolean)
  removeEngine(@Args('id', { type: () => Int }) id: number) {
    return this.engineService.remove(id);
  }

  @ResolveField('manufacturer', () => Manufacturer)
  manufacturer(@Parent() engine: Engine): Promise<Manufacturer> {
    return this.manufacturerService.findOne(engine.manufacturerId);
  }
}
