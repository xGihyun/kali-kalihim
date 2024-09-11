import { BACKEND_URL } from '$env/static/private';
import type { Section, User } from '$lib/types';
import { fail, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { superValidate } from 'sveltekit-superforms/server';
import { DeleteUsersSchema } from '$lib/schemas';

export const load: PageServerLoad = async ({ setHeaders, url, locals }) => {
	const limit = Number(url.searchParams.get('limit')) || 50;
	const skip = Number(url.searchParams.get('skip')) || 0;
	const sections = url.searchParams.get('sections');

	const getUsers = async () => {
		const users = locals.supabase
			.from('users')
			.select('first_name, last_name, id, score, section, sex, rank_overall, rank_section')
			.order('score', { ascending: false })
			.eq('role', 'user')
			.range(skip, skip + limit - 1);

		const { data, error: err } = sections
			? await users.in('section', sections.split(','))
			: await users;

		if (err) {
			console.log(err.code);
			error(500, err.message);
		}

		return data as User[];
	};

	const getUserCount = async () => {
		const { count, error: err } = await locals.supabase
			.from('users')
			.select('', { count: 'exact' });

		console.log(count);

		if (err) {
			console.log(err.code);
			error(500, err.message);
		}

		return count || 0;
	};

	const getSections = async () => {
		const { data, error: err } = await locals.supabase.from('sections').select('*').order('name');

		if (err) {
			console.log(err.code);
			error(500, err.message);
		}
		return data as Section[];
	};

	const foo = Promise.all([getUsers(), getSections(), getUserCount()]);

	setHeaders({ 'cache-control': `max-age=0, s-maxage=60, proxy-revalidate` });

	return {
		lazy: {
			foo
		},
		skip,
		filteredSections: sections,
		form: await superValidate(DeleteUsersSchema)
	};
};

export const actions: Actions = {
	delete: async (event) => {
		const form = await superValidate(event, DeleteUsersSchema);

		console.log('Forced: ', form.data.force);

		console.log('->> FORM DATA');
		console.log(form.data);

		if (!form.valid || form.data.users.length < 1) {
			return fail(400, {
				form,
				success: false,
				message: 'Invalid form data.'
			});
		}

		const response = await event.fetch(`${BACKEND_URL}/users?force=${form.data.force}`, {
			method: 'DELETE',
			body: JSON.stringify(form.data.users),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		console.log('Deleting user...');

		if (!response.ok) {
			console.log(await response.text());
			console.log(response.status);

			return fail(response.status, {
				form,
				success: false,
				message: 'Failed to delete user in the database.'
			});
		}

		form.data.users.forEach(async (id) => {
			const { error } = await event.locals.supabaseAdmin.auth.admin.deleteUser(id);

			console.log('Deleting auth data...');
			console.log(error);

			if (error) {
				return fail(error.status || 500, {
					form,
					success: false,
					message: 'Failed to delete user auth account.'
				});
			}
		});

		return {
			form,
			success: true,
			message: 'Success'
		};
	}
};
