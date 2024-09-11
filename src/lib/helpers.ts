import { invalidate, invalidateAll } from '$app/navigation';
import { crop } from '$lib/pkg/my_package';
import type { ActionResult, NumericRange } from '@sveltejs/kit';
import type { Dimensions, HttpResult, RequestType, Result } from './types';
import z, { ZodSchema, type AnyZodObject, undefined, unknown } from 'zod';
import { toast } from 'svelte-sonner';

export async function upload(
	photo: File | null,
	type: 'avatar' | 'banner',
	{ width, height }: Dimensions
) {
	if (!photo) {
		return {
			success: false,
			message: 'File not found.',
			code: 404
		};
	}

	const ogArrayBuffer = await photo.arrayBuffer();
	const bytes = new Uint8Array(ogArrayBuffer);
	const croppedAvatar = crop(bytes, width, height);

	const formData = new FormData();

	formData.append('file', new Blob([croppedAvatar]));
	formData.append('file_name', `${photo.name.split('.')[0]}.avif`);
	formData.append('type', type);

	console.log(formData);

	const response = await fetch('?/image', {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		console.error('Failed to update image.');

		return {
			success: false,
			message: 'Failed to update image.',
			code: response.status
		};
	}

	await invalidate('user:images');

	console.log('Successfully updated image.');

	return {
		success: true,
		message: 'Successfully updated image.',
		code: response.status
	};
}

export function isResult(obj: any): obj is Result {
	return obj && typeof obj === 'object' && 'success' in obj;
}

export function toResult<T>(data?: HttpResult<T>, dataSchema?: ZodSchema<T>): HttpResult<T> {
	const schema = z.object({
		success: z.boolean(),
		code: z.number(),
		message: z.string(),
		data: dataSchema ? dataSchema.optional() : undefined()
	});

	const result = schema.parse(data);

	return result;
}

export function toErrorCode(num: number): NumericRange<400, 599> {
	if (num >= 400 && num <= 599) {
		return num as NumericRange<400, 599>;
	}

	return 500;
}

export async function processActionResult(
	result: ActionResult<Record<string, any>, Record<string, unknown>>
): Promise<void> {
	switch (result.type) {
		case 'success':
		case 'failure':
			{
				const requestResult = toResult(result.data?.result);

				if (result.type === 'success') {
					toast.success(requestResult.message);

					return;
				}

				toast.error(requestResult.message);
			}

			break;
		case 'error':
			toast.error(result.error.message);

			break;
		default:
			toast.error('Unknown request type.');
			break;
	}
}
