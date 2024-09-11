import { BACKEND_URL } from '$env/static/private';
import type { PageServerLoad } from './$types';
import type { PowerCard, Result, Section, User, Badge } from '$lib/types';
import { superValidate } from 'sveltekit-superforms/server';
import { UpdateUserSchema } from '$lib/schemas';
import { fail, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, locals, setHeaders }) => {
	const { user_id } = params;

	const getUser = async () => {
		const { data, error: err } = await locals.supabase.from('users').select('*').eq('id', user_id);

		if (err) {
			return {
				code: parseInt(err.code),
				message: err.message,
				success: false
			} satisfies Result;
		}

		return data[0] as User;
	};

	const getPowerCards = async () => {
		const { data, error: err } = await locals.supabase
			.from('power_cards')
			.select('*')
			.eq('user_id', user_id)
			.order('name');

		if (err) {
			return {
				code: parseInt(err.code),
				message: err.message,
				success: false
			} satisfies Result;
		}

		return data as PowerCard[];
	};

	const getSections = async () => {
		const { data, error: err } = await locals.supabase.from('sections').select('*').order('name');

		if (err) {
			return {
				code: parseInt(err.code),
				message: err.message,
				success: false
			} satisfies Result;
		}

		return data as Section[];
	};

	const getBadges = async (): Promise<Badge[]> => {
		if (!user_id) return [];

		const response = await fetch(`${BACKEND_URL}/users/${user_id}/badges`, { method: 'GET' });

		const badges = await response.json();

		console.log('BADGES');
		console.log(badges);

		return badges;
	};

	const userData = Promise.all([getUser(), getPowerCards(), getBadges()]);

	setHeaders({ 'cache-control': `max-age=${60 * 2}, must-revalidate` });

	return {
		lazy: {
			userData
		},
		form: await superValidate(UpdateUserSchema),
		sections: getSections()
	};
};

export const actions: Actions = {
	update_user: async (event) => {
		const form = await superValidate(event, UpdateUserSchema);
		const { user_id } = event.params;

		if (!form.valid) {
			console.log('Invalid data');
			return fail(400, {
				form
			});
		}

		const response = await event.fetch(`${BACKEND_URL}/users/${user_id}`, {
			method: 'PATCH',
			body: JSON.stringify(form.data),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			console.log('Failed to update user data');
			return fail(500, {
				form
			});
		}

		return {
			form
		};
	}
};
