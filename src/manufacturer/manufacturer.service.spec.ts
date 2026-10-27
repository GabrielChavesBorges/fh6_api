import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError } from 'typeorm';
import { Country } from 'src/common/enums/country.enum';
import { Manufacturer } from './entities/manufacturer.entity';
import { ManufacturerService } from './manufacturer.service';
import { UpdateManufacturerInput } from './dto/update-manufacturer.input';

describe('ManufacturerService', () => {
  let service: ManufacturerService;

  // A fake repository: each method is a Jest mock whose result each test decides.
  const repository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    preload: jest.fn(),
    remove: jest.fn(),
  };

  const toyota: Manufacturer = { id: 1, name: 'Toyota', country: Country.JPN };
  const duplicateEntryError = new QueryFailedError('INSERT ...', [], { code: 'ER_DUP_ENTRY' } as unknown as Error);

  beforeEach(async () => {
    jest.resetAllMocks();

    const moduleRef = await Test.createTestingModule({
      providers: [ManufacturerService, { provide: getRepositoryToken(Manufacturer), useValue: repository }],
    }).compile();

    service = moduleRef.get(ManufacturerService);
  });

  describe('create', () => {
    it('saves and returns the new manufacturer', async () => {
      repository.create.mockReturnValue(toyota);
      repository.save.mockResolvedValue(toyota);

      const result = await service.create({ name: 'Toyota', country: Country.JPN });

      expect(result).toEqual(toyota);
      expect(repository.save).toHaveBeenCalledWith(toyota);
    });

    it('throws ConflictException when the name already exists', async () => {
      repository.create.mockReturnValue(toyota);
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.create({ name: 'Toyota', country: Country.JPN })).rejects.toThrow(ConflictException);
    });

    it('rethrows other database errors unchanged', async () => {
      const otherError = new Error('connection lost');
      repository.create.mockReturnValue(toyota);
      repository.save.mockRejectedValue(otherError);

      await expect(service.create({ name: 'Toyota', country: Country.JPN })).rejects.toBe(otherError);
    });
  });

  describe('findOne', () => {
    it('returns the manufacturer when it exists', async () => {
      repository.findOneBy.mockResolvedValue(toyota);

      await expect(service.findOne(1)).resolves.toEqual(toyota);
    });

    it('throws NotFoundException when it does not exist', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateInput: UpdateManufacturerInput = { id: 1, name: 'Toyoda' };
    const merged: Manufacturer = { ...toyota, ...updateInput };

    it('returns the updated manufacturer when preload finds it', async () => {
      repository.preload.mockResolvedValue(merged);
      repository.save.mockResolvedValue(merged);

      const result = await service.update(updateInput);

      expect(result).toEqual(merged);
      expect(repository.preload).toHaveBeenCalledWith(updateInput);
      expect(repository.save).toHaveBeenCalledWith(merged);
    });

    it('throws NotFoundException when preload resolves to undefined', async () => {
      repository.preload.mockResolvedValue(undefined);

      await expect(service.update({ id: 999, name: 'Toyoda' })).rejects.toThrow(NotFoundException);
      expect(repository.save).not.toHaveBeenCalled();
    });

    it('throws ConflictException when renaming to an existing name', async () => {
      const duplicateInput: UpdateManufacturerInput = { id: 2, name: 'Toyota' };
      const honda: Manufacturer = { id: 2, name: 'Honda', country: Country.JPN };
      repository.preload.mockResolvedValue({ ...honda, ...duplicateInput });
      repository.save.mockRejectedValue(duplicateEntryError);

      await expect(service.update(duplicateInput)).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('returns true and calls repository.remove with the entity', async () => {
      repository.findOneBy.mockResolvedValue(toyota);
      repository.remove.mockResolvedValue(toyota);

      await expect(service.remove(1)).resolves.toBe(true);
      expect(repository.remove).toHaveBeenCalledWith(toyota);
    });

    it('throws NotFoundException for an unknown id', async () => {
      repository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
