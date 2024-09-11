<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { RubricsTable } from '$lib/components/rubrics-table';
	import RubricForm from './rubric-form.svelte';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { writable } from 'svelte/store';
	import type { HttpResult } from '$lib/types';
	import { toast } from 'svelte-sonner';
	import { invalidate } from '$app/navigation';
	import { Skeleton } from '$lib/components/ui/skeleton';

	export let data;

	$: isDialogOpen = writable<boolean>(false);
	$: selectedRubrics = writable<number[]>([]);

	async function deleteRubrics(): Promise<void> {
		if ($selectedRubrics.length < 1) return;

		const response = await fetch(`/api/rubrics`, {
			method: 'DELETE',
			body: JSON.stringify($selectedRubrics),
			headers: {
				'content-type': 'application/json'
			}
		});

		const result: HttpResult<undefined> = await response.json();

		if (!result.success) {
			toast.error(result.message);
			return;
		}

		toast.success(result.message);

		await invalidate('admin:rubrics');
	}
</script>

<Dialog.Root bind:open={$isDialogOpen}>
	<div class="flex justify-between items-center gap-4 mb-10">
		<h1 class="font-jost-bold text-4xl md:text-6xl">Rubrics</h1>

		{#if $selectedRubrics.length > 0}
			<Button class="text-base md:text-lg h-auto" on:click={deleteRubrics}>Delete</Button>
		{:else}
			<Dialog.Trigger
				class={`text-base md:text-lg h-auto ${buttonVariants({ variant: 'default' })}`}
			>
				New
			</Dialog.Trigger>
		{/if}
	</div>

	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Create a new rubric</Dialog.Title>
		</Dialog.Header>

		<RubricForm form={data.form} {isDialogOpen} />
	</Dialog.Content>
</Dialog.Root>

{#await data.rubrics}
	<div class="grid grid-cols-5 gap-2">
		<Skeleton class="h-10 col-span-2" />
		<Skeleton class="h-10 col-span-2" />
		<Skeleton class="h-10 col-span-1" />
		{#each Array(10) as _}
			<Skeleton class="h-8 col-span-2" />
			<Skeleton class="h-8 col-span-2" />
			<Skeleton class="h-8 col-span-1" />
		{/each}
	</div>
{:then rubrics}
	<RubricsTable {rubrics} {selectedRubrics} />
{/await}
