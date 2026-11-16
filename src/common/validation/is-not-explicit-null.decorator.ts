import { ValidateIf } from 'class-validator';

// If the field is not provided, it passes validation.
// If the field is provided, but a null is passed as its value, it fails.
export const IsNotExplicitNull = () => ValidateIf((_, value) => value !== undefined);
