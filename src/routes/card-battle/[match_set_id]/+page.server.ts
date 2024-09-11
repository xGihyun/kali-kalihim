import { BACKEND_URL } from '$env/static/private';
import type { CardBattleTurn } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
	const { match_set_id } = params;

	const response = await fetch(`${BACKEND_URL}/card_battle/${match_set_id}`, {
		method: 'GET'
	});

	if (!response.ok) {
		return {
			turns: {
				user1: undefined,
				user2: undefined
			}
		};
	}

	const result: CardBattleTurn[] = await response.json();

	console.log('RESULT');
	console.log(result);

	if (result.length <= 0) {
		return {
			turns: {
				user1: undefined,
				user2: undefined
			}
		};
	}

	const user1_id = result[0].user_id || undefined;
	const user2_id = result[result.length - 1].user_id || undefined;

	const user1Turns = user1_id ? result.filter((card) => card.user_id === user1_id) : undefined;
	const user2Turns =
		user2_id && user2_id !== user1_id
			? result.filter((card) => card.user_id === user2_id)
			: undefined;

	console.log(user1Turns);
	console.log(user2Turns);

	setHeaders({ 'cache-control': `max-age=${60 * 2}, must-revalidate` });

	return {
		turns: {
			user1: user1Turns,
			user2: user2Turns
		}
	};
};
