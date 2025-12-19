import { z } from 'zod';

export const profileMapGuard = z
  .object({
    id: z.string().optional().default('id'),
    email: z.string().optional().default('email'),
    phone: z.string().optional().default('phone'),
    name: z.string().optional().default('name'),
    avatar: z.string().optional().default('avatar'),
  })
  .optional()
  .default({
    id: 'id',
    email: 'email',
    phone: 'phone',
    name: 'name',
    avatar: 'avatar',
  });

export type ProfileMap = z.infer<typeof profileMapGuard>;

export const userProfileGuard = z.object({
  id: z.string().or(z.number()).transform(String),
  email: z.string().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
});

export type UserProfile = z.infer<typeof userProfileGuard>;

export const fuzhouConnectorConfigGuard = z.object({
  institutionUrl: z.string(),
});

export type FuzhouConnectorConfig = z.infer<typeof fuzhouConnectorConfigGuard>;

export const fuzhouAuthResponseGuard = z.object({
  code: z.string(),
  state: z.string().optional(),
});

export type FuzhouAuthResponse = z.infer<typeof fuzhouAuthResponseGuard>;

export const fuzhouAccessTokenResponseGuard = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number().optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type FuzhouAccessTokenResponse = z.infer<typeof fuzhouAccessTokenResponseGuard>;
