// src/lib/validations/profile.ts
import * as z from "zod";

export const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  username: z.string().min(3, "Username minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  numberPhone: z.string().optional(),
  bio: z.string().max(160, "Bio maksimal 160 karakter").optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;