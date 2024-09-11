// import { email, number, object, string } from 'valibot';
import z from 'zod';

// export const LoginSchema = object({
// 	email: string([email()]),
// 	password: string()
// });

export const LoginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(5)
});

export const RegisterSchema = z.object({
	email: z.string().email(),
	password: z.string().min(5),
	section: z.string(),
	first_name: z.string().regex(/^[A-Za-z ]+$/, {
		message: 'String must contain only alphabets'
	}),
	last_name: z.string(),
	age: z.coerce.number(),
	contact_number: z.string(),
	sex: z.number()
});

export const EmailSchema = z.object({
	email: z.string().email()
});

// export const RegisterSchema = object({
// 	email: string([email()]),
// 	password: string(),
// 	section: string(),
// 	first_name: string(),
// 	last_name: string(),
// 	age: number(),
// 	contact_number: number(),
// 	sex: number()
// });

// export const ArnisMatchSchema = object({
// 	section: string(),
// 	skill: string(),
// 	footwork: string()
// });

export const arnisMatchSchema = z.object({
	section: z.string().min(1),
	skill: z.string().min(1)
	// footwork: z.string().min(1)
});

export type ArnisMatchSchema = typeof arnisMatchSchema;

export const UpdateScoreSchema = z.object({
	user_id: z.string(),
	score: z.number(),
	difference: z.number(),
	is_winner: z.boolean()
});

export const SubmitScoreSchema = z.object({
	user1_id: z.string(),
	user2_id: z.string(),
	user1_score: z.coerce.number().max(40).min(0),
	user2_score: z.coerce.number().max(40).min(0),
	match_set_id: z.string(),
	comment: z.string()
});

export const UpdateUserSchema = z.object({
	email: z.string().email().nullable(),
	section: z.string().nullable(),
	first_name: z.string().nullable(),
	last_name: z.string().nullable(),
	age: z.coerce.number().nullable(),
	contact_number: z.string().nullable(),
	sex: z.string().nullable(),
	score: z.coerce.number().nullable(),
	role: z.string().nullable()
});

export const SectionSchema = z.object({
	name: z.string(),
	user_limit: z.coerce.number()
});

export const DeleteUsersSchema = z.object({
	users: z.string().array(),
	force: z.coerce.boolean()
});

export const ResetPasswordSchema = z.object({
	email: z.string().email()
});

export const rubricSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	max_score: z.coerce.number()
});
