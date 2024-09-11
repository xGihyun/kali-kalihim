<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { FOOTWORKS, SKILLS } from '$lib';
	import MatchmakeForm from './matchmake-form.svelte';

	export let data;
	export let form;
</script>

<h1 class="text-4xl md:text-6xl font-jost-bold mb-10">Matchmake</h1>

<div class="mb-5">
	<MatchmakeForm form={data.form} sections={data.sections} />
</div>

{#if form?.success && form.result}
	<div class="w-full max-w-5xl">
		<Table.Root>
			<Table.Header>
				<Table.Row class="text-base md:text-lg">
					<Table.Head>Player 1</Table.Head>
					<Table.Head>VS</Table.Head>
					<Table.Head>Player 2</Table.Head>
					<Table.Head>Skill</Table.Head>
					<!-- <Table.Head>Footwork</Table.Head> -->
					<!-- <Table.Head>Status</Table.Head> -->
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each form?.result as match (match.id)}
					{@const user1 = `${match.user1_first_name} ${match.user1_last_name}`}
					{@const user2 = `${match.user2_first_name} ${match.user2_last_name}`}

					<Table.Row class="text-base md:text-lg">
						<Table.Cell>
							{user1}
						</Table.Cell>
						<Table.Cell>
							<span class="text-red-400">VS</span>
						</Table.Cell>
						<Table.Cell>{user2}</Table.Cell>
						<Table.Cell>
							{SKILLS.get(match.arnis_skill)}
						</Table.Cell>
						<!-- <Table.Cell> -->
						<!-- 	{FOOTWORKS.get(match.arnis_footwork)} -->
						<!-- </Table.Cell> -->
						<!-- <Table.Cell> -->
						<!-- 	{match.status} -->
						<!-- </Table.Cell> -->
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}
