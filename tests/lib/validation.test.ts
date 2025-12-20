/**
 * Validation Schema Tests
 *
 * Tests for Zod validation schemas
 */

import { describe, it, expect } from 'vitest';
import {
  ApiProviderSchema,
  ApiKeySchema,
  UserProfileSchema,
  JobDescriptionSchema,
  CommunitySkillSchema,
  SafeUrlSchema,
  validate,
  validateOrThrow,
  sanitizeHtml,
  isValidEmail,
  isValidUrl,
} from '../../lib/validation';

describe('API Validation Schemas', () => {
  describe('ApiProviderSchema', () => {
    it('accepts valid providers', () => {
      expect(ApiProviderSchema.parse('gemini')).toBe('gemini');
      expect(ApiProviderSchema.parse('claude')).toBe('claude');
      expect(ApiProviderSchema.parse('chatgpt')).toBe('chatgpt');
    });

    it('rejects invalid providers', () => {
      expect(() => ApiProviderSchema.parse('invalid')).toThrow();
      expect(() => ApiProviderSchema.parse('')).toThrow();
      expect(() => ApiProviderSchema.parse(123)).toThrow();
    });
  });

  describe('ApiKeySchema', () => {
    it('accepts valid API key objects', () => {
      const result = ApiKeySchema.parse({
        provider: 'gemini',
        key: 'AIzaSyD1234567890abcdefgh',
      });

      expect(result.provider).toBe('gemini');
      expect(result.key).toBe('AIzaSyD1234567890abcdefgh');
    });

    it('rejects keys that are too short', () => {
      expect(() =>
        ApiKeySchema.parse({
          provider: 'gemini',
          key: 'short',
        })
      ).toThrow(/at least 10 characters/);
    });

    it('rejects invalid provider', () => {
      expect(() =>
        ApiKeySchema.parse({
          provider: 'invalid',
          key: 'AIzaSyD1234567890abcdefgh',
        })
      ).toThrow();
    });
  });
});

describe('User Profile Validation', () => {
  describe('UserProfileSchema', () => {
    it('accepts valid profile data', () => {
      const profile = {
        fullName: 'John Doe',
        email: 'john@example.com',
        professionalTitle: 'Software Engineer',
        skills: ['JavaScript', 'TypeScript', 'React'],
      };

      const result = UserProfileSchema.parse(profile);
      expect(result.fullName).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
    });

    it('accepts empty email string', () => {
      const profile = {
        fullName: 'John Doe',
        email: '',
      };

      const result = UserProfileSchema.parse(profile);
      expect(result.email).toBe('');
    });

    it('rejects invalid email format', () => {
      expect(() =>
        UserProfileSchema.parse({
          email: 'not-an-email',
        })
      ).toThrow(/Invalid email/);
    });

    it('accepts valid URLs', () => {
      const profile = {
        linkedinUrl: 'https://linkedin.com/in/johndoe',
        portfolioUrl: 'https://johndoe.dev',
      };

      const result = UserProfileSchema.parse(profile);
      expect(result.linkedinUrl).toBe('https://linkedin.com/in/johndoe');
    });

    it('rejects name that is too long', () => {
      expect(() =>
        UserProfileSchema.parse({
          fullName: 'a'.repeat(201),
        })
      ).toThrow(/too long/);
    });

    it('rejects too many skills', () => {
      expect(() =>
        UserProfileSchema.parse({
          skills: Array(101).fill('skill'),
        })
      ).toThrow(/Too many skills/);
    });
  });
});

describe('Job Description Validation', () => {
  describe('JobDescriptionSchema', () => {
    it('accepts valid job description', () => {
      const jd = {
        rawText: 'We are looking for a Software Engineer with 5+ years of experience in building scalable applications.',
        companyName: 'Tech Corp',
        roleTitle: 'Senior Software Engineer',
      };

      const result = JobDescriptionSchema.parse(jd);
      expect(result.companyName).toBe('Tech Corp');
    });

    it('rejects job description that is too short', () => {
      expect(() =>
        JobDescriptionSchema.parse({
          rawText: 'Too short',
        })
      ).toThrow(/at least 50 characters/);
    });

    it('rejects job description that is too long', () => {
      expect(() =>
        JobDescriptionSchema.parse({
          rawText: 'a'.repeat(50001),
        })
      ).toThrow(/exceeds maximum/);
    });
  });
});

describe('Community Skill Validation', () => {
  describe('CommunitySkillSchema', () => {
    it('accepts valid community skill', () => {
      const skill = {
        title: 'Email Writer',
        description: 'A skill that helps write professional emails',
        systemPrompt: 'You are an expert email writer. Help the user compose professional emails that are clear, concise, and appropriate for the context.',
        category: 'Communication',
        tags: ['email', 'writing', 'professional'],
        inputs: [
          {
            name: 'purpose',
            label: 'Email Purpose',
            type: 'text' as const,
            required: true,
          },
        ],
      };

      const result = CommunitySkillSchema.parse(skill);
      expect(result.title).toBe('Email Writer');
      expect(result.inputs).toHaveLength(1);
    });

    it('rejects title that is too short', () => {
      expect(() =>
        CommunitySkillSchema.parse({
          title: 'AB',
          description: 'A valid description here',
          systemPrompt: 'A'.repeat(50),
          category: 'Test',
          tags: [],
          inputs: [],
        })
      ).toThrow(/at least 3 characters/);
    });

    it('rejects too many tags', () => {
      expect(() =>
        CommunitySkillSchema.parse({
          title: 'Valid Title',
          description: 'A valid description here',
          systemPrompt: 'A'.repeat(50),
          category: 'Test',
          tags: Array(21).fill('tag'),
          inputs: [],
        })
      ).toThrow(/Maximum 20 tags/);
    });
  });
});

describe('URL Validation', () => {
  describe('SafeUrlSchema', () => {
    it('accepts valid https URLs', () => {
      expect(SafeUrlSchema.parse('https://example.com')).toBe('https://example.com');
      expect(SafeUrlSchema.parse('https://api.github.com/repos')).toBe('https://api.github.com/repos');
    });

    it('accepts valid http URLs', () => {
      expect(SafeUrlSchema.parse('http://example.com')).toBe('http://example.com');
    });

    it('rejects localhost', () => {
      expect(() => SafeUrlSchema.parse('http://localhost:3000')).toThrow(/blocked address/);
      expect(() => SafeUrlSchema.parse('http://127.0.0.1:8080')).toThrow(/blocked address/);
    });

    it('rejects private IP addresses', () => {
      expect(() => SafeUrlSchema.parse('http://192.168.1.1')).toThrow(/blocked address/);
      expect(() => SafeUrlSchema.parse('http://10.0.0.1')).toThrow(/blocked address/);
      expect(() => SafeUrlSchema.parse('http://172.16.0.1')).toThrow(/blocked address/);
    });

    it('rejects non-http protocols', () => {
      expect(() => SafeUrlSchema.parse('ftp://example.com')).toThrow(/http or https/);
      expect(() => SafeUrlSchema.parse('file:///etc/passwd')).toThrow(/http or https/);
    });

    it('rejects invalid URLs', () => {
      expect(() => SafeUrlSchema.parse('not-a-url')).toThrow();
      expect(() => SafeUrlSchema.parse('')).toThrow();
    });
  });
});

describe('Validation Helper Functions', () => {
  describe('validate', () => {
    it('returns success with valid data', () => {
      const result = validate(ApiProviderSchema, 'gemini');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('gemini');
      }
    });

    it('returns errors with invalid data', () => {
      const result = validate(ApiProviderSchema, 'invalid');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(1);
      }
    });
  });

  describe('validateOrThrow', () => {
    it('returns data when valid', () => {
      const result = validateOrThrow(ApiProviderSchema, 'claude');
      expect(result).toBe('claude');
    });

    it('throws when invalid', () => {
      expect(() => validateOrThrow(ApiProviderSchema, 'invalid')).toThrow(/Validation failed/);
    });
  });

  describe('sanitizeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(sanitizeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('escapes ampersands', () => {
      expect(sanitizeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('escapes quotes', () => {
      expect(sanitizeHtml("It's a \"test\"")).toBe("It&#039;s a &quot;test&quot;");
    });

    it('leaves normal text unchanged', () => {
      expect(sanitizeHtml('Hello World')).toBe('Hello World');
    });
  });

  describe('isValidEmail', () => {
    it('returns true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.org')).toBe(true);
    });

    it('returns false for invalid emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('returns true for valid safe URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://api.service.com/endpoint')).toBe(true);
    });

    it('returns false for localhost URLs', () => {
      expect(isValidUrl('http://localhost:3000')).toBe(false);
    });

    it('returns false for private IPs', () => {
      expect(isValidUrl('http://192.168.1.1')).toBe(false);
    });

    it('returns false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
    });
  });
});
