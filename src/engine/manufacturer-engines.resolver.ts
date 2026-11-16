import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { EngineService } from './engine.service';
import { Engine } from './engine.entity';

@Resolver(() => Manufacturer)
export class ManufacturerEnginesResolver {
  constructor(private readonly engineService: EngineService) {}

  @ResolveField('engines', () => [Engine])
  engines(@Parent() manufacturer: Manufacturer): Promise<Engine[]> {
    return this.engineService.findByManufacturer(manufacturer.id);
  }
}
