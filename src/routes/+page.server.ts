import type {
	Matchmake,
	PowerCard,
	UpdatePowerCard,
	LatestOpponent,
	Result,
	Badge
} from '$lib/types';
import { redirect, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { BACKEND_URL } from '$env/static/private';
import { LoginSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms/server';
import { AuthApiError } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ fetch, locals, setHeaders, depends }) => {
	const session = await locals.getSession();
	const user_id = session?.user.id;

	const getLatestMatches = async () => {
		if (!user_id) {
			return {
				code: 404,
				message: 'User not found',
				success: false
			} satisfies Result;
		}

		const response = await fetch(`${BACKEND_URL}/matches/latest`, {
			method: 'POST',
			body: JSON.stringify({
				user_id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return {
				code: response.status,
				message: await response.text(),
				success: false
			} satisfies Result;
		}

		const matches: Matchmake[] = await response.json();

		return matches;
	};

	const getOriginalMatches = async () => {
		if (!user_id) {
			return {
				code: 404,
				message: 'User not found',
				success: false
			} satisfies Result;
		}

		const response = await fetch(`${BACKEND_URL}/matches/original`, {
			method: 'POST',
			body: JSON.stringify({
				user_id
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return {
				code: response.status,
				message: await response.text(),
				success: false
			} satisfies Result;
		}

		const matches: Matchmake[] = await response.json();

		return matches;
	};

	const getPowerCards = async () => {
		if (!user_id) {
			return {
				code: 404,
				message: 'User not found',
				success: false
			} satisfies Result;
		}

		const response = await fetch(`${BACKEND_URL}/power_cards?user_id=${user_id}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			return {
				code: response.status,
				message: await response.text(),
				success: false
			} satisfies Result;
		}

		const powerCards: PowerCard[] = await response.json();

		return powerCards;
	};

	const getLatestOpponentDetails = async (): Promise<Result | LatestOpponent | null> => {
		if (!user_id) {
			return {
				code: 404,
				message: 'User not found',
				success: false
			} satisfies Result;
		}

		const response = await fetch(`${BACKEND_URL}/matches/latest/${user_id}`, {
			method: 'GET'
		});

		if (!response.ok) {
			return {
				code: response.status,
				message: await response.text(),
				success: false
			} satisfies Result;
		}

		const latestOpponent: LatestOpponent | null = await response.json();

		return latestOpponent;
	};

	// TODO: Handle errors better
	const getBadges = async (): Promise<Badge[]> => {
		if (!user_id) return [];

		const response = await fetch(`${BACKEND_URL}/users/${user_id}/badges`, { method: 'GET' });

		const badges = await response.json();

		return badges;
	};

	const data = Promise.all([
		getPowerCards(),
		getLatestMatches(),
		getLatestOpponentDetails(),
		getOriginalMatches(),
		getBadges()
	]);

	setHeaders({ 'cache-control': `max-age=10, must-revalidate` });

	return {
		lazy: {
			data
		},
		form: await superValidate(LoginSchema)
	};
};

export const actions: Actions = {
	power_card: async ({ fetch, request, locals }) => {
		const session = await locals.getSession();
		const user_id = session?.user.id;

		if (!user_id) return;

		const formData = await request.formData();
		const card_id = formData.get('card_id') as string;
		const new_opponent_id = formData.get('new_opponent_id') as string | undefined;
		const new_power_card = formData.get('new_power_card') as string | undefined;
		const new_skill = formData.get('new_skill') as string | undefined;
		const match_set_id = formData.get('match_set_id') as string | undefined;

		const payload: UpdatePowerCard = {
			user_id,
			is_used: false,
			is_activated: true
		};

		console.log('Card: ', card_id);
		console.log('New Skill: ', new_skill);
		console.log('New Opponent: ', new_opponent_id);
		console.log('New Power Card: ', new_power_card);
		console.log('Match ID: ', match_set_id);

		const response = await Promise.all([
			twistOfFate(fetch, user_id, new_opponent_id),
			extraWind(fetch, user_id, new_power_card),
			warlordsDomain(fetch, user_id, match_set_id, new_skill)
		]);

		if (response.includes(false)) {
			return {
				success: false
			};
		}

		// Put this down here since we don't want to activate cards if previous requests results into an error
		const activate = await activatePowerCard(fetch, card_id, payload);

		if (!activate) {
			return {
				success: false
			};
		}

		return {
			success: true
		};
	},
	login: async (event) => {
		const form = await superValidate(event, LoginSchema);

		console.log(form.data);

		if (!form.valid) {
			return fail(400, {
				form,
				message: 'Invalid form data.'
			});
		}

		const { error, data } = await event.locals.supabase.auth.signInWithPassword({
			email: form.data.email,
			password: form.data.password
		});

		if (error) {
			if (error instanceof AuthApiError && error.status === 400) {
				return fail(400, {
					form,
					success: false,
					message: 'Invalid credentials.'
				});
			}

			return fail(500, {
				form,
				success: false,
				message: 'Server error. Try again later.'
			});
		}

		console.log('->> LOGIN');
		console.log(data);

		throw redirect(303, '/');
	},
	image: async ({ locals, request }) => {
		const session = await locals.getSession();
		const user_id = session?.user.id;

		if (!user_id) {
			return fail(404, {
				success: false,
				message: 'User not found.'
			});
		}

		const formData = await request.formData();

		// const photoName = formData.get('filename') as string;
		const blob = formData.get('file') as Blob;
		const fileName = formData.get('file_name') as string;
		const type = formData.get('type') as 'avatar' | 'banner';

		const newFileName = `${user_id}_${fileName}`;

		const file = new File([blob], newFileName, { type: 'image/avif' });

		const { error } = await locals.supabase.storage.from(`${type}s`).upload(newFileName, file, {
			cacheControl: '600',
			upsert: true,
			contentType: 'image/*'
		});

		if (error) {
			return fail(500, {
				success: false,
				message: error.message
			});
		}

		const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${type}s/${newFileName}`;

		const { error: err } = await locals.supabase
			.from('users')
			.update(type === 'avatar' ? { avatar_url: url } : { banner_url: url })
			.eq('id', user_id);

		if (err) {
			return fail(500, {
				success: false,
				message: err.message
			});
		}

		return {
			success: true,
			message: 'Succesfully updated image.'
		};
	}
};

async function activatePowerCard(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	card_id: string,
	payload: UpdatePowerCard
) {
	console.log('Activating power card...');

	const response = await fetch(`${BACKEND_URL}/power_cards/${card_id}`, {
		method: 'PATCH',
		body: JSON.stringify(payload),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		console.log(await response.text());
		return false;
	}

	console.log('Successfully activated power card.');
	return true;
}

async function twistOfFate(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	user_id: string,
	opponent_id: string | undefined
) {
	if (!opponent_id) return;

	console.log('Switching opponent...');

	const response = await fetch(`${BACKEND_URL}/power_cards/twist_of_fate`, {
		method: 'PATCH',
		body: JSON.stringify({
			user_id,
			selected_opponent_id: opponent_id
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		console.log(await response.text());
		return false;
	}

	console.log('Successfully switched opponents.');
	return true;
}

async function extraWind(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	user_id: string,
	card: string | undefined
) {
	if (!card) return;

	console.log('Adding new card...');

	const response = await fetch(`${BACKEND_URL}/power_cards`, {
		method: 'POST',
		body: JSON.stringify({
			user_id,
			name: card
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		console.log(await response.text());
		return false;
	}

	console.log('Successfully added new card.');
	return true;
}

async function warlordsDomain(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	user_id: string,
	match_set_id: string | undefined,
	skill: string | undefined
) {
	if (!skill || !match_set_id) return;

	console.log('Switching skill...');

	const response = await fetch(`${BACKEND_URL}/power_cards/warlords_domain`, {
		method: 'PATCH',
		body: JSON.stringify({
			user_id,
			match_set_id,
			arnis_skill: skill
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		console.log(await response.text());
		return false;
	}

	console.log('Successfully switched Arnis Skill.');
	return true;
}
