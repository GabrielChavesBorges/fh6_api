import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';
import { Car } from './car.entity';
import { CarService } from './car.service';
import { ManufacturerService } from 'src/manufacturer/manufacturer.service';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';

@Resolver(() => Car)
export class CarResolver {
  constructor(
    private readonly carService: CarService,
    private readonly manufacturerService: ManufacturerService,
  ) {}

  @Mutation(() => Car)
  createCar(
    @Args('createCarInput')
    createCarInput: CreateCarInput,
  ) {
    return this.carService.create(createCarInput);
  }

  @Query(() => [Car], { name: 'cars' })
  findAll() {
    return this.carService.findAll();
  }

  @Query(() => Car, { name: 'car' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.carService.findOne(id);
  }

  @Mutation(() => Car)
  updateCar(
    @Args('updateCarInput')
    updateCarInput: UpdateCarInput,
  ) {
    return this.carService.update(updateCarInput);
  }

  @Mutation(() => Boolean)
  removeCar(@Args('id', { type: () => Int }) id: number) {
    return this.carService.remove(id);
  }

  @ResolveField('manufacturer', () => Manufacturer)
  manufacturer(@Parent() car: Car): Promise<Manufacturer> {
    return this.manufacturerService.findOne(car.manufacturerId);
  }
}
