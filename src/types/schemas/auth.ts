import { z } from "astro/zod";

const FullNameSchema = z.object({
  first_name: z.string(),
  middle_name: z.string().optional(),
  last_name: z.string(),
});

export const RegisterSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(7),
    confirm_password: z.string().min(7),

    sex: z.enum(["male", "female"]),
    birth_date: z.coerce.date(),
  })
  .merge(FullNameSchema)
  .refine(({ password, confirm_password }) => password === confirm_password, {
    message: "Passwords don't match.",
    path: ["confirm_password"],
  });

export const PlayerSeasonSchema = z.object({
  section_id: z.string(),
  user_id: z.string()
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(7),
});

export type Register = z.infer<typeof RegisterSchema>
