import { describe, it, expect } from 'vitest';
import { getSignUpSchema, getLoginSchema, getPasswordSchema } from '../validation';

// Mocking the translation strings
const t = (key: string) => key;

// TC-044: one shared password chain backs signup, onboarding, brand creation
// and reset. These cases are the contract every one of those surfaces inherits.
describe('getPasswordSchema (shared account password policy)', () => {
  const schema = getPasswordSchema(t as any);

  const expectRejection = (password: string, expectedKey: string) => {
    const result = schema.safeParse(password);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(expectedKey);
    }
  };

  it('rejects a password with no symbol', () => {
    expectRejection('Abcdefg1', 'auth.validation.passwordSymbol');
  });

  it('rejects a password with no uppercase', () => {
    expectRejection('abcdefg1!', 'auth.validation.passwordUppercase');
  });

  it('rejects a password with no lowercase', () => {
    expectRejection('ABCDEFG1!', 'auth.validation.passwordLowercase');
  });

  it('rejects a password with no digit', () => {
    expectRejection('Abcdefgh!', 'auth.validation.passwordNumber');
  });

  it('rejects a 7-character password even with all four classes', () => {
    expectRejection('Abc1!xy', 'auth.validation.passwordMin');
  });

  it('accepts an 8-character password with all four classes', () => {
    expect(schema.safeParse('Abcdefg1!').success).toBe(true);
  });

  it('treats a space as a symbol', () => {
    expect(schema.safeParse('Abcdefg1 ').success).toBe(true);
  });

  it('uses the "validation" key namespace when asked (reset password page)', () => {
    const resetSchema = getPasswordSchema(t as any, 'validation');
    const result = resetSchema.safeParse('Abcdefg1');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('validation.passwordSymbol');
    }
  });
});

describe('Validation Schemas', () => {
  describe('SignUp Schema', () => {
    const signUpSchema = getSignUpSchema(t as any);

    it('should validate a correct signup object', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        agreeToTerms: true,
      };
      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject names that are only whitespace', () => {
      const invalidData = {
        firstName: '  ',
        lastName: '  ',
        email: ' john.doe@example.com ',
        password: 'Password123!',
        agreeToTerms: true,
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('firstName'))).toBe(true);
        expect(result.error.issues.some(i => i.path.includes('lastName'))).toBe(true);
      }
    });

    // TC-044: a symbol is required on every account password surface. Owner
    // signup used to be the one path that accepted 'Password123'.
    it('should reject password without a symbol', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
        agreeToTerms: true,
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(
          result.error.issues.find(i => i.path.includes('password'))?.message,
        ).toBe('auth.validation.passwordSymbol');
      }
    });

    it('should accept password with all four character classes', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        agreeToTerms: true,
      };
      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password without a number', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password',
        confirmPassword: 'Password',
        agreeToTerms: true,
      };
      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.find(i => i.path.includes('password'))?.message).toBe('auth.validation.passwordNumber');
      }
    });
  });

  describe('Login Schema', () => {
    const loginSchema = getLoginSchema(t as any);

    it('should validate a correct login object', () => {
      const validData = {
        email: 'john.doe@example.com',
        password: 'Password123!',
      };
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail if email is invalid', () => {
      const invalidData = {
        email: 'not-an-email',
        password: 'Password123!',
      };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('auth.validation.emailInvalid');
      }
    });
  });
});
