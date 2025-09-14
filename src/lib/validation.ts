import { z } from "zod";

export const urlSchema = z
  .object({
    originalUrl: z
      .string()
      .min(1, "URL is required")
      .refine((url) => {
        try {
          new URL(url.startsWith("http") ? url : `https://${url}`);
          return true;
        } catch {
          return false;
        }
      }, "Please enter a valid URL"),
    customCode: z
      .string()
      .optional()
      .refine((code) => {
        if (!code) return true;
        return (
          /^[a-zA-Z0-9-_]+$/.test(code) && code.length >= 3 && code.length <= 20
        );
      }, "Custom code must be 3-20 characters and contain only letters, numbers, hyphens, and underscores"),
    title: z.string().optional(),
    description: z.string().optional(),
    expiresAt: z.string().optional(),
    password: z.string().optional(),
    isPasswordProtected: z.boolean().optional(),
  })
  .refine(
    (data) => {
      // If password protection is enabled, password must be provided
      if (data.isPasswordProtected && !data.password) {
        return false;
      }
      return true;
    },
    {
      message: "Password is required when password protection is enabled",
      path: ["password"],
    },
  );

export const passwordAccessSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
