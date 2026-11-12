import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { CarResolver } from './car.resolver';
import { CarService } from './car.service';
import { Car } from './car.entity';
import { ManufacturerCarsResolver } from './manufacturer-cars.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Car]), ManufacturerModule],
  providers: [CarResolver, ManufacturerCarsResolver, CarService],
})
export class CarModule {}
