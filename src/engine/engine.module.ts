import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ManufacturerModule } from 'src/manufacturer/manufacturer.module';
import { EngineResolver } from './engine.resolver';
import { EngineService } from './engine.service';
import { Engine } from './engine.entity';
import { ManufacturerEnginesResolver } from './manufacturer-engines.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Engine]), ManufacturerModule],
  providers: [EngineResolver, ManufacturerEnginesResolver, EngineService],
})
export class EngineModule {}
