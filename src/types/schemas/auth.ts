import { z } from "astro/zod";

const FullNameSchema = z.object({
  firstName: z.string(),
  middleName: z.string().optional(),
  lastName: z.string(),
});

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(7),
    confirmPassword: z.string().min(7),

    sex: z.enum(["male", "female"]),
    birthDate: z.coerce.date(),
  })
  .merge(FullNameSchema)
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

export const PlayerSeasonSchema = z.object({
  sectionId: z.string(),
  userId: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type PlayerSeasonInput = z.infer<typeof PlayerSeasonSchema>;
