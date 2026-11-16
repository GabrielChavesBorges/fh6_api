import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isDuplicateEntry } from 'src/common/database/is-duplicate-entry';
import { isForeignKeyNotFound } from 'src/common/database/is-foreign-key-not-found';
import { QueryFailedError, Repository } from 'typeorm';
import { Car } from './car.entity';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
  ) {}

  async create(createCarInput: CreateCarInput): Promise<Car> {
    const car = this.carRepository.create(createCarInput);
    try {
      return await this.carRepository.save(car);
    } catch (error) {
      if (isDuplicateEntry(error)) {
        throw new ConflictException(`Car "${createCarInput.name}" already exists.`);
      } else if (isForeignKeyNotFound(error)) {
        const isMissingEngineError = (error as QueryFailedError).message.includes('`engine_id`');
        if (isMissingEngineError) {
          throw new NotFoundException(`Engine ${createCarInput.engineId} not found.`);
        } else {
          throw new NotFoundException(`Manufacturer ${createCarInput.manufacturerId} not found.`);
        }
      }
      throw error;
    }
  }

  findAll(): Promise<Car[]> {
    return this.carRepository.find();
  }

  async findOne(id: number): Promise<Car> {
    const car = await this.carRepository.findOneBy({ id });
    if (!car) {
      throw new NotFoundException(`Car ${id} not found.`);
    }
    return car;
  }

  async update(updateCarInput: UpdateCarInput): Promise<Car> {
    const car = await this.carRepository.preload(updateCarInput);
    if (!car) {
      throw new NotFoundException(`Car ${updateCarInput.id} not found.`);
    }
    try {
      return await this.carRepository.save(car);
    } catch (error) {
      if (isDuplicateEntry(error)) {
        const errorMessage = `Car "${car.name}" already exists.`;
        throw new ConflictException(errorMessage);
      } else if (isForeignKeyNotFound(error)) {
        const isMissingEngineError = (error as QueryFailedError).message.includes('`engine_id`');
        if (isMissingEngineError) {
          throw new NotFoundException(`Engine ${updateCarInput.engineId} not found.`);
        } else {
          throw new NotFoundException(`Manufacturer ${updateCarInput.manufacturerId} not found.`);
        }
      }
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    const carToDelete = await this.findOne(id);
    await this.carRepository.remove(carToDelete);
    return true;
  }

  findByManufacturer(manufacturerId: number): Promise<Car[]> {
    return this.carRepository.findBy({ manufacturerId });
  }

  findByEngine(engineId: number): Promise<Car[]> {
    return this.carRepository.findBy({ engineId });
  }
}
