import { BACKEND_URL } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, fetch }) => {
	const section = url.searchParams.get('section');
	const set = Number(url.searchParams.get('set')) || 1;

	console.log('Set ', set);
	console.log('Section ', section);
	console.log('Running card battle...');

	const response = await fetch(`${BACKEND_URL}/card_battle?set=${set}&section=${section}`, {
		method: 'GET'
	});

	if (response.ok) {
		console.log('Card Battle Successful.');
	} else {
		console.error('Card Battle failed: ' + (await response.text()));
	}

	return new Response();
};
