import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from './car.entity';
import { QueryFailedError, Repository } from 'typeorm';

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
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException(`Car "${createCarInput.name}" already exists.`);
      } else if (this.isManufacturerNotFound(error)) {
        throw new NotFoundException(`Manufacturer ${createCarInput.manufacturerId} not found.`);
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
      if (this.isDuplicateEntry(error)) {
        const errorMessage = `Car "${car.name}" already exists.`;
        throw new ConflictException(errorMessage);
      } else if (this.isManufacturerNotFound(error)) {
        throw new NotFoundException(`Manufacturer ${updateCarInput.manufacturerId} not found.`);
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
}
