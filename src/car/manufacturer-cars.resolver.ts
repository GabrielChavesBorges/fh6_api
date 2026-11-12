import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Manufacturer } from 'src/manufacturer/entities/manufacturer.entity';
import { CarService } from './car.service';
import { Car } from './entities/car.entity';

@Resolver(() => Manufacturer)
export class ManufacturerCarsResolver {
  constructor(private readonly carService: CarService) {}

  @ResolveField('cars', () => [Car])
  cars(@Parent() manufacturer: Manufacturer): Promise<Car[]> {
    return this.carService.findByManufacturer(manufacturer.id);
  }
}
