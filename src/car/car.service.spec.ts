import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Country } from 'src/common/enums/country.enum';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { Engine } from 'src/engine/engine.entity';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { Car } from './car.entity';
import { CarService } from './car.service';
import { CreateCarInput } from './dto/create-car.input';
import { UpdateCarInput } from './dto/update-car.input';

describe('CarService', () => {
  let service: CarService;

  // A fake repository: each method is a Jest mock whose result each test decides.
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findBy: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  const honda: Manufacturer = { id: 1, name: 'Honda', country: Country.JPN, cars: [], engines: [] };
  const k20: Engine = {
    id: 1,
    name: 'K20C1',
    displacementCc: 1996,
    cylinders: 4,
    stockPowerHp: 306,
    stockTorqueNm: 400,
    layout: EngineLayout.INLINE,
    isHybrid: false,
    manufacturerId: 1,
    manufacturer: honda,
    cars: [],
  };

  const civicInput: CreateCarInput = { name: 'Civic Type R', manufacturerId: 1, stockEngineId: 1 };
  const civic: Car = { id: 1, ...civicInput, manufacturer: honda, stockEngine: k20 };

  const duplicateEntryError = new QueryFailedError('INSERT ...', [], { code: 'ER_DUP_ENTRY' } as unknown as Error);

  // Mimics the mysql2 driver error for a failed foreign key; the message names the column that failed.
  const foreignKeyError = (column: 'manufacturer_id' | 'stock_engine_id', table: 'manufacturer' | 'engine') => {
    const sqlMessage =
      'Cannot add or update a child row: a foreign key constraint fails ' +
      `(\`fh6\`.\`car\`, CONSTRAINT \`FK_car_${column}\` FOREIGN KEY (\`${column}\`) REFERENCES \`${table}\` (\`id\`))`;
    return new QueryFailedError('INSERT ...', [], {
      code: 'ER_NO_REFERENCED_ROW_2',
      errno: 1452,
      message: sqlMessage,
      sqlMessage,
    } as unknown as Error);
  };
  const missingManufacturerError = foreignKeyError('manufacturer_id', 'manufacturer');
  const missingEngineError = foreignKeyError('stock_engine_id', 'engine');

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [CarService, { provide: getRepositoryToken(Car), useValue: repository }],
    }).compile();

    service = moduleRef.get(CarService);
  });

  describe('create', () => {
    it('saves and returns the new car', async () => {
      repository.create.mockReturnValue(civic);
      repository.save.mockResolvedValue(civic);

      const result = await service.create(civicInput);

      expect(result).toEqual(civic);
      expect(repository.create).toHaveBeenCalledWith(civicInput);
      expect(repository.save).toHaveBeenCalledWith(civic);
    });

    it('throws ConflictException when the name already exists', async () => {
      repository.create.mockReturnValue(civic);
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.create(civicInput)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException naming the manufacturer when the manufacturer does not exist', async () => {
      repository.create.mockReturnValue(civic);
      repository.save.mockRejectedValue(missingManufacturerError);

      await expect(service.create({ ...civicInput, manufacturerId: 999 })).rejects.toThrow(
        new NotFoundException('Manufacturer 999 not found.'),
      );
    });

    it('throws NotFoundException naming the engine when the engine does not exist', async () => {
      repository.create.mockReturnValue(civic);
      repository.save.mockRejectedValue(missingEngineError);

      await expect(service.create({ ...civicInput, stockEngineId: 999 })).rejects.toThrow(
        new NotFoundException('Engine 999 not found.'),
      );
    });

    it('rethrows other database errors unchanged', async () => {
      const otherError = new Error('connection lost');
      repository.create.mockReturnValue(civic);
      repository.save.mockRejectedValue(otherError);

      await expect(service.create(civicInput)).rejects.toBe(otherError);
    });
  });

  describe('findAll', () => {
    it('returns every car', async () => {
      repository.find.mockResolvedValue([civic]);

      await expect(service.findAll()).resolves.toEqual([civic]);
    });
  });

  describe('findOne', () => {
    it('returns the car when it exists', async () => {
      repository.findOneBy.mockResolvedValue(civic);

      await expect(service.findOne(1)).resolves.toEqual(civic);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('throws NotFoundException when it does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByManufacturer', () => {
    it('queries cars by manufacturer id', async () => {
      repository.findBy.mockResolvedValue([civic]);

      await expect(service.findByManufacturer(1)).resolves.toEqual([civic]);
      expect(repository.findBy).toHaveBeenCalledWith({ manufacturerId: 1 });
    });
  });

  describe('findByEngine', () => {
    it('queries cars by engine id', async () => {
      repository.findBy.mockResolvedValue([civic]);

      await expect(service.findByEngine(1)).resolves.toEqual([civic]);
      expect(repository.findBy).toHaveBeenCalledWith({ stockEngineId: 1 });
    });
  });

  describe('update', () => {
    const updateInput: UpdateCarInput = { id: 1, name: 'Civic Type R (FL5)' };
    const merged: Car = { ...civic, ...updateInput };

    it('returns the updated car when preload finds it', async () => {
      repository.preload.mockResolvedValue(merged);
      repository.save.mockResolvedValue(merged);

      const result = await service.update(updateInput);

      expect(result).toEqual(merged);
      expect(repository.preload).toHaveBeenCalledWith(updateInput);
      expect(repository.save).toHaveBeenCalledWith(merged);
    });

    it('can swap the engine', async () => {
      const swapInput: UpdateCarInput = { id: 1, stockEngineId: 2 };
      const swapped: Car = { ...civic, stockEngineId: 2 };
      repository.preload.mockResolvedValue(swapped);
      repository.save.mockResolvedValue(swapped);

      await expect(service.update(swapInput)).resolves.toEqual(swapped);
      expect(repository.save).toHaveBeenCalledWith(swapped);
    });

    it('throws NotFoundException when preload resolves to undefined', async () => {
      repository.preload.mockResolvedValue(undefined);

      await expect(service.update({ id: 999, name: 'Ghost' })).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when renaming to an existing name', async () => {
      repository.preload.mockResolvedValue({ ...civic, name: 'NSX' });
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.update({ id: 1, name: 'NSX' })).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException naming the manufacturer when moving to one that does not exist', async () => {
      repository.preload.mockResolvedValue({ ...civic, manufacturerId: 999 });
      repository.save.mockRejectedValue(missingManufacturerError);

      await expect(service.update({ id: 1, manufacturerId: 999 })).rejects.toThrow(
        new NotFoundException('Manufacturer 999 not found.'),
      );
    });

    it('throws NotFoundException naming the engine when swapping to one that does not exist', async () => {
      repository.preload.mockResolvedValue({ ...civic, stockEngineId: 999 });
      repository.save.mockRejectedValue(missingEngineError);

      await expect(service.update({ id: 1, stockEngineId: 999 })).rejects.toThrow(
        new NotFoundException('Engine 999 not found.'),
      );
    });

    it('rethrows other database errors unchanged', async () => {
      const otherError = new Error('connection lost');
      repository.preload.mockResolvedValue(merged);
      repository.save.mockRejectedValue(otherError);

      await expect(service.update(updateInput)).rejects.toBe(otherError);
    });
  });

  describe('remove', () => {
    it('returns true and calls repository.remove with the entity', async () => {
      repository.findOneBy.mockResolvedValue(civic);
      repository.remove.mockResolvedValue(civic);

      await expect(service.remove(1)).resolves.toBe(true);
      expect(repository.remove).toHaveBeenCalledWith(civic);
    });

    it('throws NotFoundException for an unknown id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
