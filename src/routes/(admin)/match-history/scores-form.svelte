<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import type { SuperValidated } from 'sveltekit-superforms';
	import { SubmitScoreSchema } from '$lib/schemas';
	import { CheckCircled, CrossCircled, Reload } from 'radix-icons-svelte';
	import { enhance } from '$app/forms';
	import type { RequestStatus, Rubric } from '$lib/types';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	// import type { ActionData } from './$types';

	// export let formAction: boolean = false;
	export let form: SuperValidated<typeof SubmitScoreSchema>;
	export let user1_id: string;
	export let user2_id: string;
	export let user1_name: string = 'N/A';
	export let user2_name: string = 'N/A';
	export let match_set_id: string;
	export let rubrics: Rubric[];

	let requestStatus: RequestStatus = {
		type: 'none'
	};

	let playerScores: number[][] = Array(2)
		.fill(null)
		.map(() => Array(rubrics.length).fill(0));

	$: sums = playerScores.map((scores) => scores.reduce((acc, curr) => +acc + +curr, 0)) as number[];
</script>

<Form.Root {form} schema={SubmitScoreSchema} let:config let:attrs>
	<form
		action="/match-history?/submit_score"
		class="space-y-6"
		method="post"
		use:enhance={() => {
			console.log('Updating...');
			requestStatus = {
				type: 'pending'
			};

			return async ({ result, update }) => {
				await update();

				console.log(result);

				if (result.type === 'success' || result.type === 'redirect') {
					console.log('Successfully submitted score.');

					requestStatus = {
						type: 'success',
						code: result.status,
						message: result.data.message
					};
				} else {
					console.error('Failed to submit score.');
					requestStatus = {
						type: 'error',
						code: result.status,
						message: result.data.message
					};
				}
			};
		}}
		{...attrs}
	>
		<input type="text" name="user1_id" value={user1_id} hidden required />
		<input type="text" name="user2_id" value={user2_id} hidden required />
		<input type="number" name="user1_score" value={sums[0]} hidden required />
		<input type="number" name="user2_score" value={sums[1]} hidden required />
		<input type="text" name="match_set_id" value={match_set_id} hidden required />

		<div class="space-y-4">
			<h3 class="font-jost-medium text-base md:text-lg">
				{user1_name}
			</h3>
			{#each rubrics as rubric, idx (rubric.id)}
				<div class="space-y-2">
					<Label class="text-sm md:text-base"
						>{rubric.title}
						<span class="text-muted-foreground">({rubric.max_score} points)</span></Label
					>
					{#if rubric.description}
						<p class="text-muted-foreground text-xs md:text-sm">{rubric.description}</p>
					{/if}
					<Input
						type="number"
						class="text-base md:text-lg"
						required
						bind:value={playerScores[0][idx]}
					/>
				</div>
			{/each}
		</div>

		<div class="space-y-4">
			<h3 class="font-jost-medium text-base md:text-lg">
				{user2_name}
			</h3>
			{#each rubrics as rubric, idx (rubric.id)}
				<div class="space-y-2">
					<Label class="text-sm md:text-base"
						>{rubric.title}
						<span class="text-muted-foreground">({rubric.max_score} points)</span></Label
					>
					{#if rubric.description}
						<p class="text-muted-foreground text-xs md:text-sm">{rubric.description}</p>
					{/if}
					<Input
						type="number"
						class="text-base md:text-lg"
						required
						bind:value={playerScores[1][idx]}
					/>
				</div>
			{/each}
		</div>

		<!-- <Form.Field {config} name="user1_score"> -->
		<!-- 	<Form.Item class="text-base md:text-lg"> -->
		<!-- 		<Form.Label class="text-base md:text-lg">{user1_name}</Form.Label> -->
		<!-- 		<Form.Input type="number" class="text-base md:text-lg" required value={sums[0]} /> -->
		<!-- 		<Form.Validation /> -->
		<!-- 	</Form.Item> -->
		<!-- </Form.Field> -->
		<!---->
		<!-- <Form.Field {config} name="user2_score"> -->
		<!-- 	<Form.Item> -->
		<!-- 		<Form.Label class="text-base md:text-lg">{user2_name}</Form.Label> -->
		<!-- 		<Form.Input type="number" class="text-base md:text-lg" required /> -->
		<!-- 		<Form.Validation /> -->
		<!-- 	</Form.Item> -->
		<!-- </Form.Field> -->

		<Separator />

		<Form.Field {config} name="comment">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Comment</Form.Label>
				<Form.Textarea class="text-base md:text-lg" required />
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<div class="flex w-full justify-between items-center mt-4">
			<Form.Button
				class={`text-base md:text-lg h-auto w-full ${
					requestStatus.type === 'success'
						? 'bg-green-500 pointer-events-none'
						: requestStatus.type === 'error'
							? 'bg-red-500 hover:bg-red-600'
							: requestStatus.type === 'pending'
								? 'bg-yellow-500 pointer-events-none'
								: 'bg-primary'
				}`}
			>
				<div class="flex items-center gap-1">
					{#if requestStatus.type === 'pending'}
						<Reload class="h-5 w-5 animate-spin" />
						<span class="text-base md:text-lg">Submitting...</span>
					{:else if requestStatus.type === 'success'}
						<CheckCircled class="h-5 w-5 " />
						<span class="text-base md:text-lg">Success</span>
					{:else if requestStatus.type === 'error'}
						<CrossCircled class="h-5 w-5 " />
						<span class="text-base md:text-lg">
							{requestStatus.message}
						</span>
					{:else}
						<span class="text-base md:text-lg">Submit</span>
					{/if}
				</div>
			</Form.Button>
		</div>
	</form>
</Form.Root>
