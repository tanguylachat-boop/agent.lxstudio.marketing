import { describe, it, expect } from 'vitest';
import { IdeaSchema, GenerateIdeasRequestSchema } from './idea.js';

describe('IdeaSchema', () => {
  it('should validate a valid idea', () => {
    const validIdea = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Idea',
      hook1: 'Hook number one',
      hook2: 'Hook number two',
      hook3: 'Hook number three',
      angle: 'This is the angle of the idea',
      cta: 'Call to action',
      created_at: new Date().toISOString(),
    };

    const result = IdeaSchema.safeParse(validIdea);
    expect(result.success).toBe(true);
  });

  it('should reject an idea with missing fields', () => {
    const invalidIdea = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test',
    };

    const result = IdeaSchema.safeParse(invalidIdea);
    expect(result.success).toBe(false);
  });
});

describe('GenerateIdeasRequestSchema', () => {
  it('should use default count of 20', () => {
    const request = {};
    const result = GenerateIdeasRequestSchema.parse(request);
    expect(result.count).toBe(20);
  });

  it('should validate custom count', () => {
    const request = { count: 10 };
    const result = GenerateIdeasRequestSchema.parse(request);
    expect(result.count).toBe(10);
  });
});
