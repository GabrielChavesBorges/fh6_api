import { registerEnumType } from '@nestjs/graphql';

export enum EngineLayout {
  V = 'V',
  W = 'W',
  FLAT = 'FLAT',
  INLINE = 'INLINE',
  ROTARY = 'ROTARY',
  ELECTRIC = 'ELECTRIC',
}

registerEnumType(EngineLayout, { name: 'EngineLayout' });
