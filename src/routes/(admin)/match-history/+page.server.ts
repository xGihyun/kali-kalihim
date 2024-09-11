import type { Matchmake, MaxSet, Rubric, Section, UpdateScore } from '$lib/types';
import { fail, type Actions, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SubmitScoreSchema } from '$lib/schemas';
import { superValidate } from 'sveltekit-superforms/server';
import { BACKEND_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, url, depends, setHeaders, locals }) => {
	const section = url.searchParams.get('section');
	const set = Number(url.searchParams.get('set')) || 1;
	const matchType = url.searchParams.get('match_type') || 'arnis';

	const getMatches = async () => {
		const response = await fetch(`${BACKEND_URL}/matches?set=${set}&section=${section}`, {
			method: 'GET'
		});

		if (response.ok) {
			const matches: Matchmake[] = await response.json();

			return matches;
		}

		return null;
	};

	const getOriginalMatches = async () => {
		const response = await fetch(
			`${BACKEND_URL}/matches?set=${set}&section=${section}&original=true`,
			{
				method: 'GET'
			}
		);

		if (response.ok) {
			const matches: Matchmake[] = await response.json();

			return matches;
		}

		return null;
	};

	const getSections = async () => {
		const { data, error: err } = await locals.supabase.from('sections').select('*').order('name');

		if (err) {
			console.log(err.code);
			error(500, err.message);
		}

		return data as Section[] | null;
	};

	const getMaxSets = async () => {
		const response = await fetch(`${BACKEND_URL}/max_sets`, { method: 'GET' });
		const maxSets: MaxSet[] = await response.json();

		if (response.ok) {
			return maxSets;
		}

		return null;
	};

	const getRubrics = async () => {
		const response = await fetch(`${BACKEND_URL}/rubrics`, { method: 'GET' });
		const rubrics: Rubric[] = await response.json();

		return rubrics;
	};

	const data = Promise.all([
		getMatches(),
		getOriginalMatches(),
		getSections(),
		getMaxSets(),
		getRubrics()
	]);

	depends('card-battle:damage');

	return {
		lazy: {
			data
		},
		form: await superValidate(SubmitScoreSchema),
		selectedSection: section,
		selectedSet: set,
		selectedMatchType: matchType
	};
};

// This is pretty bad
export const actions: Actions = {
	submit_score: async (event) => {
		const form = await superValidate(event, SubmitScoreSchema);

		console.log(form.data);

		if (!form.valid) {
			return fail(400, {
				form,
				success: false,
				message: 'Invalid form data.'
			});
		}

		const { user1_id, user2_id, user1_score, user2_score, match_set_id } = form.data;
		const difference = Math.abs(user1_score - user2_score);

		console.log('Score difference: ', difference);
		console.log('Verdict: ');
		console.log(getVerdict(user1_score, user2_score));
		console.log(getVerdict(user2_score, user1_score));

		const data1: UpdateScore = {
			user_id: user1_id,
			score: user1_score,
			is_winner: getVerdict(user1_score, user2_score),
			difference,
			match_set_id
		};

		const data2: UpdateScore = {
			user_id: user2_id,
			score: user2_score,
			is_winner: getVerdict(user2_score, user1_score),
			difference,
			match_set_id
		};

		const submitScore1 = await submitScore(data1, event.fetch);
		const submitScore2 = await submitScore(data2, event.fetch);

		if (!submitScore1.success) {
			return fail(submitScore1.code, {
				form,
				success: false,
				message: submitScore1.message
			});
		}

		if (!submitScore2.success) {
			return fail(submitScore2.code, {
				form,
				success: false,
				message: submitScore2.message
			});
		}

		const updateMatch = await updateMatchStatus(event.fetch, match_set_id, 'done');

		if (!updateMatch.success) {
			return fail(updateMatch.code, {
				form,
				success: false,
				message: updateMatch.message
			});
		}

		const comment = await insertComment(event.fetch, match_set_id, form.data.comment);

		if (!comment.success) {
			return fail(comment.code, {
				form,
				success: false,
				message: comment.message
			});
		}

		return {
			form,
			success: true,
			message: 'Success!'
		};
	}
};

function getVerdict(user_score: number, opponent_score: number): 'win' | 'lose' | 'draw' {
	if (user_score > opponent_score) {
		return 'win';
	}

	if (user_score < opponent_score) {
		return 'lose';
	}

	return 'draw';
}

async function submitScore(
	data: UpdateScore,
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>
) {
	console.log('Submitting...');

	const response = await fetch(`${BACKEND_URL}/scores`, {
		method: 'PATCH',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		return {
			success: false,
			message: 'Failed to submit score.',
			code: response.status
		};
	}

	console.log('Successfully submitted score.');

	return {
		success: true,
		message: 'Successfully submitted score.',
		code: response.status
	};
}

async function updateMatchStatus(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	match_set_id: string,
	status: 'pending' | 'done'
) {
	console.log('Updating status...');
	console.log(match_set_id);
	console.log(status);

	const response = await fetch(`${BACKEND_URL}/matches/${match_set_id}`, {
		method: 'PATCH',
		body: JSON.stringify({
			status
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		return {
			success: false,
			code: response.status,
			message: 'Failed to update match status.'
		};
	}

	console.log('Successfully updated match status to: ', status);

	return {
		success: true,
		message: `Successfully updated match status to: ${status}`,
		code: response.status
	};
}

async function insertComment(
	fetch: (input: URL | RequestInfo, init?: RequestInit | undefined) => Promise<Response>,
	match_set_id: string,
	comment: string
) {
	const response = await fetch(`${BACKEND_URL}/matches/${match_set_id}/comment`, {
		method: 'PATCH',
		body: JSON.stringify({
			comment
		}),
		headers: {
			'Content-Type': 'application/json'
		}
	});

	if (!response.ok) {
		return {
			success: false,
			code: response.status,
			message: 'Failed to update match status.'
		};
	}

	return {
		success: true,
		message: `Successfully inserted comment.`,
		code: response.status
	};
}
