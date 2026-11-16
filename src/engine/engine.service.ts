import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEngineInput } from './dto/create-engine.input';
import { UpdateEngineInput } from './dto/update-engine.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Engine } from './engine.entity';
import { QueryFailedError, Repository } from 'typeorm';
import { getLayoutViolations } from './engine-layout.rule';

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
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException(
          `Engine "${createEngineInput.name}" with manufacturer id "${createEngineInput.manufacturerId}" already exists.`,
        );
      } else if (this.isManufacturerNotFound(error)) {
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
      if (this.isDuplicateEntry(error)) {
        const errorMessage = `Engine "${engine.name}" already exists.`;
        throw new ConflictException(errorMessage);
      } else if (this.isManufacturerNotFound(error)) {
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

  private isDuplicateEntry(error: unknown): boolean {
    const notQueryFail = !(error instanceof QueryFailedError);
    if (notQueryFail) {
      return false;
    }

    const isDuplicateFailure = (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY';
    return isDuplicateFailure;
  }

  private isManufacturerNotFound(error: unknown): boolean {
    const notQueryFail = !(error instanceof QueryFailedError);
    if (notQueryFail) {
      return false;
    }

    const errorCode = (error.driverError as { code?: string }).code;
    const isManufacturerNotFoundFailure = errorCode === 'ER_NO_REFERENCED_ROW_2';
    return isManufacturerNotFoundFailure;
  }

  private assertValidLayout(engine: Engine): void {
    const violations = getLayoutViolations(engine);
    if (violations.length > 0) {
      throw new BadRequestException(violations);
    }
  }
}
