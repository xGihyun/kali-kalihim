import { BACKEND_URL } from '$env/static/private';
import { toErrorCode } from '$lib/helpers';
import { error, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, fetch, url }) => {
	const user_id = url.searchParams.get('user_id');

	if (!user_id) error(404, 'User ID not found');

	const badges: string[] = await request.json();

	const response = await fetch(`${BACKEND_URL}/users/${user_id}/badges`, {
		method: 'POST',
		body: JSON.stringify(badges),
		headers: {
			'content-type': 'application/json'
		}
	});

	if (!response.ok) {
		error(toErrorCode(response.status), await response.text());
	}

	return new Response('Successfully updated badges.');
};
