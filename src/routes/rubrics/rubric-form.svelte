<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { processActionResult } from '$lib/helpers';
	import { rubricSchema } from '$lib/schemas';
	import type { RubricSchema } from '$lib/types';
	import type { Writable } from 'svelte/store';
	import type { SuperValidated } from 'sveltekit-superforms';

	export let form: SuperValidated<RubricSchema>;
	export let isDialogOpen: Writable<boolean>;
</script>

<Form.Root
	method="POST"
	action="?/create"
	{form}
	schema={rubricSchema}
	let:config
	options={{
		clearOnSubmit: 'none',
		onResult: ({ result }) => {
			console.log(result);
			processActionResult(result);

			if (result.type === 'success') {
				$isDialogOpen = false;
			}
		}
	}}
>
	<Form.Field {config} name="title">
		<Form.Item>
			<Form.Label class="text-base md:text-lg">Title</Form.Label>
			<Form.Textarea class="text-base md:text-lg" required />
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	<Form.Field {config} name="description">
		<Form.Item>
			<Form.Label class="text-base md:text-lg">Description</Form.Label>
			<Form.Textarea class="text-base md:text-lg" />
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	<Form.Field {config} name="max_score">
		<Form.Item>
			<Form.Label class="text-base md:text-lg">Max Score</Form.Label>
			<Form.Input type="number" class="text-base md:text-lg h-auto" />
			<Form.Validation />
		</Form.Item>
	</Form.Field>

	<Form.Button class="text-base md:text-lg h-auto w-full mt-4">Submit</Form.Button>
</Form.Root>
