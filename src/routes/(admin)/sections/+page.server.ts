import { BACKEND_URL } from '$env/static/private';
import type { Section } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, setHeaders, depends }) => {
	const response = await fetch(`${BACKEND_URL}/sections/count`, { method: 'GET' });
	const sections: Section[] = await response.json();

	depends('sections:table');

	setHeaders({ 'cache-control': `max-age=5, must-revalidate` });

	return {
		sections
	};
};
