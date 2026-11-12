import { Module } from '@nestjs/common';
import { ManufacturerService } from './manufacturer.service';
import { ManufacturerResolver } from './manufacturer.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacturer } from './manufacturer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Manufacturer])],
  providers: [ManufacturerResolver, ManufacturerService],
  exports: [ManufacturerService],
})
export class ManufacturerModule {}
