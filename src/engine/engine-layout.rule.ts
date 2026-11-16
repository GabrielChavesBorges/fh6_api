import { EngineLayout } from 'src/common/enums/engine-layout.enum';
import { Engine } from './engine.entity';

type LayoutFields = Pick<Engine, 'layout' | 'displacementCc' | 'cylinders' | 'isHybrid'>;

const PISTON_LAYOUTS = [EngineLayout.FLAT, EngineLayout.INLINE, EngineLayout.V, EngineLayout.W];

export function getLayoutViolations(engine: LayoutFields): string[] {
  const violations: string[] = [];
  const hasDisplacement = engine.displacementCc != null;
  const hasCylinders = engine.cylinders != null;

  if (PISTON_LAYOUTS.includes(engine.layout)) {
    if (!hasDisplacement) {
      violations.push(`${engine.layout} engines require a displacement value.`);
    }
    if (!hasCylinders) {
      violations.push(`${engine.layout} engines require a cylinders value.`);
    }
  } else if (engine.layout === EngineLayout.ROTARY) {
    if (!hasDisplacement) {
      violations.push('ROTARY engines require a displacement value.');
    }
    if (hasCylinders) {
      violations.push('ROTARY engines must not have cylinders.');
    }
  } else if (engine.layout === EngineLayout.ELECTRIC) {
    if (hasDisplacement) {
      violations.push('ELECTRIC engines must not have displacement.');
    }
    if (hasCylinders) {
      violations.push('ELECTRIC engines must not have cylinders.');
    }
    if (engine.isHybrid) {
      violations.push('ELECTRIC engines cannot be hybrid.');
    }
  }

  return violations;
}
