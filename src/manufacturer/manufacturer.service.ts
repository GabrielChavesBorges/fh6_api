import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateManufacturerInput } from './dto/create-manufacturer.input';
import { UpdateManufacturerInput } from './dto/update-manufacturer.input';
import { InjectRepository } from '@nestjs/typeorm';
import { Manufacturer } from './entities/manufacturer.entity';
import { QueryFailedError, Repository } from 'typeorm';

@Injectable()
export class ManufacturerService {
  constructor(
    @InjectRepository(Manufacturer)
    private readonly manufacturerRepository: Repository<Manufacturer>,
  ) {}

  async create(createManufacturerInput: CreateManufacturerInput): Promise<Manufacturer> {
    const manufacturer = this.manufacturerRepository.create(createManufacturerInput);
    try {
      return await this.manufacturerRepository.save(manufacturer);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        throw new ConflictException(`Manufacturer "${createManufacturerInput.name}" already exists.`);
      }
      throw error;
    }
  }

  findAll(): Promise<Manufacturer[]> {
    return this.manufacturerRepository.find();
  }

  async findOne(id: number): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.findOneBy({ id });
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer ${id} not found.`);
    }
    return manufacturer;
  }

  async update(updateManufacturerInput: UpdateManufacturerInput): Promise<Manufacturer> {
    const manufacturer = await this.manufacturerRepository.preload(updateManufacturerInput);
    if (!manufacturer) {
      throw new NotFoundException(`Manufacturer ${updateManufacturerInput.id} not found.`);
    }
    try {
      return await this.manufacturerRepository.save(manufacturer);
    } catch (error) {
      if (this.isDuplicateEntry(error)) {
        const errorMessage = `Manufacturer "${manufacturer.name}" already exists.`;
        throw new ConflictException(errorMessage);
      }
      throw error;
    }
  }

  async remove(id: number): Promise<boolean> {
    const manufacturerToDelete = await this.findOne(id);
    await this.manufacturerRepository.remove(manufacturerToDelete);
    return true;
  }

  private isDuplicateEntry(error: unknown): boolean {
    const notQueryFail = !(error instanceof QueryFailedError);
    if (notQueryFail) {
      return false;
    }

    const isDuplicateFailure = (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY';
    return isDuplicateFailure;
  }
}
