import { registerEnumType } from '@nestjs/graphql';

export enum Country { // Alpha-3 code standard
  JPN = 'JPN', // Japan
  DEU = 'DEU', // Germany
}

registerEnumType(Country, { name: 'Country' });