import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { getLayoutViolations } from './engine-layout.rule';

describe('getLayoutViolations', () => {
  describe.each([EngineLayout.INLINE, EngineLayout.V, EngineLayout.FLAT, EngineLayout.W])('%s (piston)', (layout) => {
    it('accepts displacement and cylinders', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1996, cylinders: 4, isHybrid: false })).toEqual([]);
    });

    it('accepts a hybrid', () => {
      expect(getLayoutViolations({ layout, displacementCc: 4593, cylinders: 8, isHybrid: true })).toEqual([]);
    });

    it('rejects a missing displacement', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: 4, isHybrid: false })).toEqual([
        `${layout} engines require a displacement value.`,
      ]);
    });

    it('rejects missing cylinders', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1996, cylinders: null, isHybrid: false })).toEqual([
        `${layout} engines require a cylinders value.`,
      ]);
    });

    it('reports both problems at once', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: null, isHybrid: false })).toHaveLength(2);
    });
  });

  describe('ROTARY', () => {
    const layout = EngineLayout.ROTARY;

    it('accepts displacement without cylinders', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1308, cylinders: null, isHybrid: false })).toEqual([]);
    });

    it('accepts a hybrid', () => {
      expect(getLayoutViolations({ layout, displacementCc: 830, cylinders: null, isHybrid: true })).toEqual([]);
    });

    it('rejects a missing displacement', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: null, isHybrid: false })).toEqual([
        'ROTARY engines require a displacement value.',
      ]);
    });

    it('rejects cylinders', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1308, cylinders: 2, isHybrid: false })).toEqual([
        'ROTARY engines must not have cylinders.',
      ]);
    });
  });

  describe('ELECTRIC', () => {
    const layout = EngineLayout.ELECTRIC;

    it('accepts no displacement, no cylinders and not hybrid', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: null, isHybrid: false })).toEqual([]);
    });

    it('treats undefined the same as null', () => {
      expect(
        getLayoutViolations({
          layout,
          displacementCc: undefined as unknown as null,
          cylinders: undefined as unknown as null,
          isHybrid: false,
        }),
      ).toEqual([]);
    });

    it('rejects displacement', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1996, cylinders: null, isHybrid: false })).toEqual([
        'ELECTRIC engines must not have displacement.',
      ]);
    });

    it('rejects cylinders', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: 4, isHybrid: false })).toEqual([
        'ELECTRIC engines must not have cylinders.',
      ]);
    });

    it('rejects being hybrid', () => {
      expect(getLayoutViolations({ layout, displacementCc: null, cylinders: null, isHybrid: true })).toEqual([
        'ELECTRIC engines cannot be hybrid.',
      ]);
    });

    it('reports every problem at once', () => {
      expect(getLayoutViolations({ layout, displacementCc: 1996, cylinders: 4, isHybrid: true })).toHaveLength(3);
    });
  });
});
