import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { UpdateEngineInput } from './update-engine.input';

// Returns the names of the properties that failed validation.
const invalidProperties = (plain: object): string[] =>
  validateSync(plainToInstance(UpdateEngineInput, plain)).map((error) => error.property);

describe('UpdateEngineInput', () => {
  it('accepts an update with only the id', () => {
    expect(invalidProperties({ id: 1 })).toEqual([]);
  });

  it('accepts valid values for every field', () => {
    expect(
      invalidProperties({
        id: 1,
        name: 'K20A',
        displacementCc: 1998,
        cylinders: 4,
        stockPowerHp: 220,
        stockTorqueNm: 206,
        layout: EngineLayout.INLINE,
        isHybrid: false,
        manufacturerId: 1,
      }),
    ).toEqual([]);
  });

  it.each(['name', 'stockPowerHp', 'stockTorqueNm', 'layout', 'isHybrid', 'manufacturerId'])(
    'rejects an explicit null for the required field %s',
    (field) => {
      expect(invalidProperties({ id: 1, [field]: null })).toEqual([field]);
    },
  );

  it.each(['displacementCc', 'cylinders'])('accepts an explicit null for the nullable field %s', (field) => {
    expect(invalidProperties({ id: 1, [field]: null })).toEqual([]);
  });

  it('still applies the rules inherited from CreateEngineInput', () => {
    expect(invalidProperties({ id: 1, name: '', stockPowerHp: 0 })).toEqual(['name', 'stockPowerHp']);
  });
});
