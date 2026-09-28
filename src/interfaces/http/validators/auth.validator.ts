import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(8).max(72),
});

export const loginUserSchema = z.object({
  email: z.string().trim().email().max(255).toLowerCase(),
  password: z.string().min(1).max(72),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
