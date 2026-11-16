import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Engine } from 'src/engine/engine.entity';
import { CarService } from './car.service';
import { Car } from './car.entity';

@Resolver(() => Engine)
export class EngineCarsResolver {
  constructor(private readonly carService: CarService) {}

  @ResolveField('cars', () => [Car])
  cars(@Parent() engine: Engine): Promise<Car[]> {
    return this.carService.findByEngine(engine.id);
  }
}
