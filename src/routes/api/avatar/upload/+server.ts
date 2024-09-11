import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ fetch, request, locals, url }) => {
	const session = await locals.getSession();
	const user_id = session?.user.id;
	const query = url.searchParams.get('image');

	if (!user_id || !query) {
		throw new Error('Failed to update avatar.');
	}

	const formData = await request.formData();

	const photoName = formData.get('filename') as string;
	const file = formData.get('file') as Blob;
	const fileName = `${user_id}_${photoName}`;

	const { data, error } = await locals.supabase.storage
		.from(query)
		.upload(`/public/${fileName}`, file, {
			cacheControl: '3600',
			upsert: true
		});

	console.log(data?.path);

	return new Response();
};
