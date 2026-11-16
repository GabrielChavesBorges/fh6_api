import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isDuplicateEntry } from 'src/common/database/is-duplicate-entry';
import { isForeignKeyNotFound } from 'src/common/database/is-foreign-key-not-found';
import { Repository } from 'typeorm';
import { CreateEngineInput } from './dto/create-engine.input';
import { UpdateEngineInput } from './dto/update-engine.input';
import { getLayoutViolations } from './engine-layout.rule';
import { Engine } from './engine.entity';

@Injectable()
export class EngineService {
  constructor(
    @InjectRepository(Engine)
    private readonly engineRepository: Repository<Engine>,
  ) {}

  async create(createEngineInput: CreateEngineInput): Promise<Engine> {
    const engine = this.engineRepository.create(createEngineInput);
    this.assertValidLayout(engine);

    try {
      return await this.engineRepository.save(engine);
    } catch (error) {
      if (isDuplicateEntry(error)) {
        throw new ConflictException(
          `Engine "${createEngineInput.name}" with manufacturer id "${createEngineInput.manufacturerId}" already exists.`,
        );
      } else if (isForeignKeyNotFound(error)) {
        throw new NotFoundException(`Manufacturer ${createEngineInput.manufacturerId} not found.`);
      }
      throw error;
    }
  }

  findAll(): Promise<Engine[]> {
    return this.engineRepository.find();
  }

  async findOne(id: number): Promise<Engine> {
    const engine = await this.engineRepository.findOneBy({ id });
    if (!engine) {
      throw new NotFoundException(`Engine ${id} not found.`);
    }
    return engine;
  }

  async update(updateEngineInput: UpdateEngineInput): Promise<Engine> {
    const engine = await this.engineRepository.preload(updateEngineInput);
    if (!engine) {
      throw new NotFoundException(`Engine ${updateEngineInput.id} not found.`);
    }
    this.assertValidLayout(engine);

    try {
      return await this.engineRepository.save(engine);
    } catch (error) {
      if (isDuplicateEntry(error)) {
        const errorMessage = `Engine "${engine.name}" with manufacturer "${engine.manufacturerId}" already exists.`;
        throw new ConflictException(errorMessage);
      } else if (isForeignKeyNotFound(error)) {
        throw new NotFoundException(`Manufacturer ${updateEngineInput.manufacturerId} not found.`);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    const engineToDelete = await this.findOne(id);
    await this.engineRepository.remove(engineToDelete);
    return true;
  }

  findByManufacturer(manufacturerId: number): Promise<Engine[]> {
    return this.engineRepository.findBy({ manufacturerId });
  }

  private assertValidLayout(engine: Engine): void {
    const violations = getLayoutViolations(engine);
    if (violations.length > 0) {
      throw new BadRequestException(violations);
    }
  }
}
