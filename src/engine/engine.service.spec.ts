import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Country } from 'src/common/enums/country.enum';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { Manufacturer } from 'src/manufacturer/manufacturer.entity';
import { CreateEngineInput } from './dto/create-engine.input';
import { UpdateEngineInput } from './dto/update-engine.input';
import { Engine } from './engine.entity';
import { EngineService } from './engine.service';

describe('EngineService', () => {
  let service: EngineService;

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

  const k20Input: CreateEngineInput = {
    name: 'K20C1',
    displacementCc: 1996,
    cylinders: 4,
    stockPowerHp: 306,
    stockTorqueNm: 400,
    layout: EngineLayout.INLINE,
    isHybrid: false,
    manufacturerId: 1,
  };
  const k20: Engine = { id: 1, ...k20Input, manufacturer: honda };

  const duplicateEntryError = new QueryFailedError('INSERT ...', [], { code: 'ER_DUP_ENTRY' } as unknown as Error);
  const missingManufacturerError = new QueryFailedError('INSERT ...', [], {
    code: 'ER_NO_REFERENCED_ROW_2',
  } as unknown as Error);

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [EngineService, { provide: getRepositoryToken(Engine), useValue: repository }],
    }).compile();

    service = moduleRef.get(EngineService);
  });

  describe('create', () => {
    it('saves and returns the new engine', async () => {
      repository.create.mockReturnValue(k20);
      repository.save.mockResolvedValue(k20);

      const result = await service.create(k20Input);

      expect(result).toEqual(k20);
      expect(repository.create).toHaveBeenCalledWith(k20Input);
      expect(repository.save).toHaveBeenCalledWith(k20);
    });

    it('accepts an electric engine without displacement or cylinders', async () => {
      const electricInput: CreateEngineInput = {
        ...k20Input,
        name: 'MCF5',
        displacementCc: null,
        cylinders: null,
        stockPowerHp: 152,
        stockTorqueNm: 315,
        layout: EngineLayout.ELECTRIC,
      };
      const electric: Engine = { id: 2, ...electricInput, manufacturer: honda };
      repository.create.mockReturnValue(electric);
      repository.save.mockResolvedValue(electric);

      await expect(service.create(electricInput)).resolves.toEqual(electric);
    });

    it('throws BadRequestException and does not save when the layout rule is broken', async () => {
      const invalidInput: CreateEngineInput = { ...k20Input, layout: EngineLayout.ELECTRIC };
      repository.create.mockReturnValue({ ...k20, ...invalidInput });

      await expect(service.create(invalidInput)).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('includes every layout violation in the error response', async () => {
      const invalidInput: CreateEngineInput = { ...k20Input, layout: EngineLayout.ELECTRIC, isHybrid: true };
      repository.create.mockReturnValue({ ...k20, ...invalidInput });

      const error = await service.create(invalidInput).catch((e: BadRequestException) => e);

      expect(error).toBeInstanceOf(BadRequestException);
      expect((error as BadRequestException).getResponse()).toMatchObject({
        message: [
          'ELECTRIC engines must not have displacement.',
          'ELECTRIC engines must not have cylinders.',
          'ELECTRIC engines cannot be hybrid.',
        ],
      });
    });

    it('throws ConflictException when the name already exists for the manufacturer', async () => {
      repository.create.mockReturnValue(k20);
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.create(k20Input)).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when the manufacturer does not exist', async () => {
      repository.create.mockReturnValue(k20);
      repository.save.mockRejectedValue(missingManufacturerError);

      await expect(service.create({ ...k20Input, manufacturerId: 999 })).rejects.toThrow(NotFoundException);
    });

    it('rethrows other database errors unchanged', async () => {
      const otherError = new Error('connection lost');
      repository.create.mockReturnValue(k20);
      repository.save.mockRejectedValue(otherError);

      await expect(service.create(k20Input)).rejects.toBe(otherError);
    });
  });

  describe('findAll', () => {
    it('returns every engine', async () => {
      repository.find.mockResolvedValue([k20]);

      await expect(service.findAll()).resolves.toEqual([k20]);
    });
  });

  describe('findOne', () => {
    it('returns the engine when it exists', async () => {
      repository.findOneBy.mockResolvedValue(k20);

      await expect(service.findOne(1)).resolves.toEqual(k20);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });

    it('throws NotFoundException when it does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByManufacturer', () => {
    it('queries engines by manufacturer id', async () => {
      repository.findBy.mockResolvedValue([k20]);

      await expect(service.findByManufacturer(1)).resolves.toEqual([k20]);
      expect(repository.findBy).toHaveBeenCalledWith({ manufacturerId: 1 });
    });
  });

  describe('update', () => {
    const updateInput: UpdateEngineInput = { id: 1, stockPowerHp: 315 };
    const merged: Engine = { ...k20, ...updateInput };

    it('returns the updated engine when preload finds it', async () => {
      repository.preload.mockResolvedValue(merged);
      repository.save.mockResolvedValue(merged);

      const result = await service.update(updateInput);

      expect(result).toEqual(merged);
      expect(repository.preload).toHaveBeenCalledWith(updateInput);
      expect(repository.save).toHaveBeenCalledWith(merged);
    });

    it('validates the merged engine, not just the partial input', async () => {
      // The input only changes the layout; the old displacement and cylinders come from the stored engine.
      const layoutOnlyInput: UpdateEngineInput = { id: 1, layout: EngineLayout.ELECTRIC };
      repository.preload.mockResolvedValue({ ...k20, ...layoutOnlyInput });

      await expect(service.update(layoutOnlyInput)).rejects.toThrow(BadRequestException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('allows switching to ELECTRIC when displacement and cylinders are cleared in the same update', async () => {
      const toElectricInput: UpdateEngineInput = {
        id: 1,
        layout: EngineLayout.ELECTRIC,
        displacementCc: null,
        cylinders: null,
      };
      const electric: Engine = { ...k20, ...toElectricInput } as Engine;
      repository.preload.mockResolvedValue(electric);
      repository.save.mockResolvedValue(electric);

      await expect(service.update(toElectricInput)).resolves.toEqual(electric);
      expect(repository.save).toHaveBeenCalledWith(electric);
    });

    it('throws NotFoundException when preload resolves to undefined', async () => {
      repository.preload.mockResolvedValue(undefined);

      await expect(service.update({ id: 999, stockPowerHp: 315 })).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when renaming to an existing name', async () => {
      repository.preload.mockResolvedValue({ ...k20, name: 'K20A' });
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.update({ id: 1, name: 'K20A' })).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when moving to a manufacturer that does not exist', async () => {
      repository.preload.mockResolvedValue({ ...k20, manufacturerId: 999 });
      repository.save.mockRejectedValue(missingManufacturerError);

      await expect(service.update({ id: 1, manufacturerId: 999 })).rejects.toThrow(NotFoundException);
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
      repository.findOneBy.mockResolvedValue(k20);
      repository.remove.mockResolvedValue(k20);

      await expect(service.remove(1)).resolves.toBe(true);
      expect(repository.remove).toHaveBeenCalledWith(k20);
    });

    it('throws NotFoundException for an unknown id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
