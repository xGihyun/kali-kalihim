<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { Matchmake, Rubric } from '$lib/types';
	import ScoresForm from './scores-form.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { SubmitScoreSchema } from '$lib/schemas';
	import { CheckCircled, Clock } from 'radix-icons-svelte';
	import { snakeCaseToTitleCase } from '$lib';

	export let form: SuperValidated<typeof SubmitScoreSchema>;
	export let rubrics: Rubric[];
	export let matches: Matchmake[];

	let clickedRow: string | null = null;

	function toggleRow(id: string) {
		clickedRow = clickedRow === id ? null : id;
	}
</script>

<Table.Root class="border ">
	<Table.Header>
		<Table.Row class="text-base md:text-lg pointer-events-none">
			<Table.Head>Player 1</Table.Head>
			<Table.Head class="font-jost-medium">VS</Table.Head>
			<Table.Head>Player 2</Table.Head>
			<Table.Head>Skill</Table.Head>
			<!-- <Table.Head>Footwork</Table.Head> -->
			<Table.Head>Status</Table.Head>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		{#each matches as match (match.id)}
			{@const user1 = `${match.user1_first_name} ${match.user1_last_name}`}
			{@const user2 = `${match.user2_first_name} ${match.user2_last_name}`}

			<Table.Row
				class="text-base md:text-lg cursor-pointer {match.status === 'done'
					? 'opacity-50 pointer-events-none'
					: 'opacity-100'}"
				on:click={() => toggleRow(match.id)}
			>
				<Table.Cell>
					{user1}
				</Table.Cell>
				<Table.Cell class="text-red-400 font-jost-medium">VS</Table.Cell>
				<Table.Cell>{user2}</Table.Cell>
				<Table.Cell>
					{snakeCaseToTitleCase(match.arnis_skill)}
				</Table.Cell>
				<!-- <Table.Cell> -->
				<!-- 	{snakeCaseToTitleCase(match.arnis_footwork)} -->
				<!-- </Table.Cell> -->
				<Table.Cell class="flex items-center gap-2">
					{#if match.status === 'done'}
						<CheckCircled class="w-5 h-5 text-green-500" />
					{:else}
						<Clock class="w-5 h-5 text-yellow-500" />
					{/if}
					{match.status}
				</Table.Cell>
			</Table.Row>

			<Dialog.Root open={clickedRow === match.id} closeOnOutsideClick={false}>
				<Dialog.Content class="max-h-[90svh] overflow-auto">
					<Dialog.Header>
						<Dialog.Title>Score Submission</Dialog.Title>
						<Dialog.Description>Enter your scores for each player.</Dialog.Description>
					</Dialog.Header>

					<ScoresForm
						{form}
						user1_id={match.user1_id}
						user2_id={match.user2_id}
						user1_name={user1}
						user2_name={user2}
						match_set_id={match.id}
						{rubrics}
					/>
				</Dialog.Content>
			</Dialog.Root>
		{/each}
	</Table.Body>
</Table.Root>
