import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateManufacturerInput } from './dto/create-manufacturer.input';
import { UpdateManufacturerInput } from './dto/update-manufacturer.input';
import { Manufacturer } from './entities/manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';

@Resolver(() => Manufacturer)
export class ManufacturerResolver {
  constructor(private readonly manufacturerService: ManufacturerService) {}

  @Mutation(() => Manufacturer)
  createManufacturer(
    @Args('createManufacturerInput')
    createManufacturerInput: CreateManufacturerInput,
  ) {
    return this.manufacturerService.create(createManufacturerInput);
  }

  @Query(() => [Manufacturer], { name: 'manufacturers' })
  findAll() {
    return this.manufacturerService.findAll();
  }

  @Query(() => Manufacturer, { name: 'manufacturer' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.manufacturerService.findOne(id);
  }

  @Mutation(() => Manufacturer)
  updateManufacturer(
    @Args('updateManufacturerInput')
    updateManufacturerInput: UpdateManufacturerInput,
  ) {
    return this.manufacturerService.update(updateManufacturerInput);
  }

  @Mutation(() => Boolean)
  removeManufacturer(@Args('id', { type: () => Int }) id: number) {
    return this.manufacturerService.remove(id);
  }
}
