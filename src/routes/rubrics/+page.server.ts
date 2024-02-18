import { BACKEND_URL } from '$env/static/private';
import type { HttpResult, Rubric } from '$lib/types';
import { superValidate } from 'sveltekit-superforms/server';
import type { PageServerLoad } from './$types';
import { rubricSchema } from '$lib/schemas';
import { fail, type Actions } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ fetch, depends }) => {
	const response = await fetch(`${BACKEND_URL}/rubrics`, { method: 'GET' });
	const rubrics: Rubric[] = await response.json();

	depends('admin:rubrics');

	return {
		form: await superValidate(rubricSchema),
		rubrics
	};
};

export const actions: Actions = {
	create: async (event) => {
		const form = await superValidate(event, rubricSchema);

		let result: HttpResult<Rubric> = {
			success: false,
			code: 500,
			message: 'Unexpected error.'
		};

		if (!form.valid) {
			result.message = 'Invalid form data.';
			result.code = 400;

			return fail(400, {
				form,
				result
			});
		}

		const response = await event.fetch(`${BACKEND_URL}/rubrics`, {
			method: 'POST',
			body: JSON.stringify(form.data),
			headers: { 'content-type': 'application/json' }
		});

		result = {
			success: response.ok,
			code: response.status,
			message: response.ok ? `Successfully added rubric: ${form.data.title}` : await response.text()
		};

		if (!result.success) {
			return fail(response.status, {
				form,
				result
			});
		}

		return {
			form,
			result
		};
	}
};
