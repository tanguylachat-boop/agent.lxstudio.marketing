import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.js';
import { ValidationError } from './errors.js';

describe('validate', () => {
  const TestSchema = z.object({
    name: z.string(),
    age: z.number().int().positive(),
  });

  it('should validate correct data', () => {
    const data = { name: 'John', age: 30 };
    const result = validate(TestSchema, data);

    expect(result).toEqual(data);
  });

  it('should throw ValidationError for invalid data', () => {
    const data = { name: 'John', age: -5 };

    expect(() => validate(TestSchema, data)).toThrow(ValidationError);
  });

  it('should throw ValidationError for missing fields', () => {
    const data = { name: 'John' };

    expect(() => validate(TestSchema, data)).toThrow(ValidationError);
  });
});
