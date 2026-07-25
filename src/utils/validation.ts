import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Common validation schemas for the Mintcom Landing application.
 * Centralizing these allows for consistent validation logic across pages
 * and enables robust unit testing.
 */

/**
 * Account password policy — the single source of truth for every password
 * field on the website (signup, onboarding, reset). Mirrors the API's
 * `ACCOUNT_PASSWORD_RULES` in `mintcom-api/src/common/security/password.policy.ts`.
 *
 * Rule: min 8 chars, one uppercase, one lowercase, one digit, one symbol.
 * TC-044 drifted because this chain was copy-pasted into four places — do not
 * hand-roll it again, import `getPasswordSchema` instead.
 *
 * `keyPrefix` exists because the pages use two different i18n namespaces:
 * 'auth.validation' (signup / onboarding) and 'validation' (reset password).
 */
export const getPasswordSchema = (
  t: TFunction,
  keyPrefix: 'auth.validation' | 'validation' = 'auth.validation',
) =>
  z
    .string()
    .min(8, t(`${keyPrefix}.passwordMin`))
    .regex(/[A-Z]/, t(`${keyPrefix}.passwordUppercase`))
    .regex(/[a-z]/, t(`${keyPrefix}.passwordLowercase`))
    .regex(/[0-9]/, t(`${keyPrefix}.passwordNumber`))
    .regex(/[^A-Za-z0-9]/, t(`${keyPrefix}.passwordSymbol`));

export const getSignUpSchema = (t: TFunction) => {
  return z.object({
    firstName: z.string().trim().min(2, t('auth.validation.firstNameMin')),
    lastName: z.string().trim().min(2, t('auth.validation.lastNameMin')),
    email: z.string().trim().email(t('auth.validation.emailInvalid')),
    password: getPasswordSchema(t),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('auth.validation.termsRequired'),
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.validation.passwordsDoNotMatch'),
    path: ['confirmPassword'],
  });
};

export const getLoginSchema = (t: TFunction) => {
  return z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(1, t('auth.validation.passwordRequired')),
  });
};

export const getContactSchema = (t: TFunction) => {
  return z.object({
    name: z.string().min(2, t('landing.contact.validation.nameMin')),
    email: z.string().email(t('landing.contact.validation.emailInvalid')),
    subject: z.string().min(2, t('landing.contact.validation.subjectMin')),
    message: z.string().min(10, t('landing.contact.validation.messageMin')),
  });
};

export type SignUpFormData = z.infer<ReturnType<typeof getSignUpSchema>>;
export type LoginFormData = z.infer<ReturnType<typeof getLoginSchema>>;
export type ContactFormData = z.infer<ReturnType<typeof getContactSchema>>;
