import { BACKEND_URL } from '$env/static/private';
import { toErrorCode } from '$lib/helpers';
import type { HttpResult } from '$lib/types';
import { error, json, type RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ fetch, request }) => {
	const rubricIds: number[] = await request.json();

	console.log(rubricIds);

	let result: HttpResult<undefined> = {
		success: false,
		code: 500,
		message: 'Unexpected error.'
	};

	const response = await fetch(`${BACKEND_URL}/rubrics`, {
		method: 'DELETE',
		body: JSON.stringify(rubricIds),
		headers: {
			'content-type': 'application/json'
		}
	});

	result = {
		success: response.ok,
		code: response.status,
		message: response.ok ? `Sucessfully deleted rubrics.` : await response.text()
	};

	if (!result.success) {
		error(toErrorCode(result.code), result.message);
	}

	return json(result);
};
