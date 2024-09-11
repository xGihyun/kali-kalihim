<script lang="ts">
	import * as Select from '$lib/components/ui/select';
	import { Button } from '$lib/components/ui/button';
	import { AlertCircle, Swords } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { invalidate } from '$app/navigation';
	import { MATCH_TYPES, snakeCaseToTitleCase } from '$lib';
	import ArnisTable from './arnis-table.svelte';
	import CardBattleTable from './card-battle-table.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { CheckCircled, CrossCircled, Reload } from 'radix-icons-svelte';
	import type { RequestStatus } from '$lib/types';

	export let data;

	$: ({ selectedSet, selectedSection, selectedMatchType } = data);

	let requestStatus: RequestStatus = {
		type: 'none'
	};

	async function runCardBattle() {
		console.log('Set ', selectedSet);
		console.log('Section ', selectedSection);
		console.log('Running card battle...');

		requestStatus.type = 'pending';

		const response = await fetch(`/api/card_battle?set=${selectedSet}&section=${selectedSection}`, {
			method: 'GET'
		});

		if (response.ok) {
			console.log('Success card battle');
			await invalidate('card-battle:damage');
			requestStatus.type = 'success';
		} else {
			console.error('Failed to run card battle.');
			requestStatus.type = 'error';
		}
	}
</script>

<h1 class="text-4xl md:text-6xl font-jost-bold mb-10">Match History</h1>

<div class="w-full mx-auto">
	<div class="flex gap-2 mb-5 flex-col sm:flex-row">
		<div class="flex gap-2 w-full">
			{#await data.lazy.data}
				<Skeleton class="min-h-10 w-80" />
			{:then [matches, ogMatches, sections, maxSets, rubrics]}
				{#if sections}
					<Select.Root
						selected={{
							value: selectedSection,
							label: snakeCaseToTitleCase(selectedSection)
						}}
					>
						<Select.Trigger class="flex-[2] h-auto">
							<Select.Value placeholder="Section" class="text-base md:text-lg" />
						</Select.Trigger>
						<Select.Content>
							{#each sections as section (section.id)}
								<a
									class="contents"
									href={`/match-history?set=${selectedSet}&section=${section.id}&match_type=${selectedMatchType}`}
								>
									<Select.Item value={section.id} class="text-base md:text-lg h-auto">
										{section.name}
									</Select.Item>
								</a>
							{/each}
						</Select.Content>
					</Select.Root>
				{:else}
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description
							>Failed to fetch sections. Please check your connection.</Alert.Description
						>
					</Alert.Root>
				{/if}
			{/await}

			{#await data.lazy.data}
				<Skeleton class="min-h-10 w-60" />
			{:then [matches, ogMatches, sections, maxSets, rubrics]}
				{#if maxSets}
					<Select.Root selected={{ value: selectedSet, label: `Match ${selectedSet}` }}>
						<Select.Trigger class="flex-1 h-auto">
							<Select.Value placeholder="Match Set" class="text-base md:text-lg" />
						</Select.Trigger>
						<Select.Content>
							{#each maxSets as maxSet (maxSet.section)}
								{#if maxSet.section === selectedSection}
									{#each Array(maxSet.max_set) as _, idx (idx)}
										<a
											class="contents"
											href={`/match-history?set=${
												idx + 1
											}&section=${selectedSection}&match_type=${selectedMatchType}`}
										>
											<Select.Item value={idx + 1} class="text-base md:text-lg h-auto">
												{idx + 1}
											</Select.Item>
										</a>
									{/each}
								{/if}
							{/each}
						</Select.Content>
					</Select.Root>
				{:else}
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description
							>Failed to fetch match sets. Please check your connection.</Alert.Description
						>
					</Alert.Root>
				{/if}
			{/await}

			<Select.Root
				selected={{ value: selectedMatchType, label: MATCH_TYPES.get(selectedMatchType) }}
			>
				<Select.Trigger class="flex-1 h-auto">
					<Select.Value placeholder="Match Set" class="text-base md:text-lg" />
				</Select.Trigger>
				<Select.Content>
					{#each MATCH_TYPES as [key, value] (key)}
						<a
							class="contents"
							href={`/match-history?set=${selectedSet}&section=${selectedSection}&match_type=${key}`}
						>
							<Select.Item value={key} class="text-base md:text-lg h-auto">
								{value}
							</Select.Item>
						</a>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if selectedMatchType === 'card_battle'}
			<Button
				class={`text-base md:text-lg h-auto ${
					requestStatus.type === 'success'
						? 'bg-green-500 pointer-events-none'
						: requestStatus.type === 'error'
							? 'bg-red-500 hover:bg-red-600'
							: requestStatus.type === 'pending'
								? 'bg-yellow-500 pointer-events-none'
								: 'bg-primary'
				}`}
				on:click={runCardBattle}
			>
				<div class="flex items-center gap-1">
					{#if requestStatus.type === 'pending'}
						<Reload class="h-5 w-5 animate-spin" />
					{:else if requestStatus.type === 'success'}
						<CheckCircled class="h-5 w-5" />
					{:else if requestStatus.type === 'error'}
						<CrossCircled class="h-5 w-5" />
					{:else}
						<Swords class="h-5 w-5" />
					{/if}

					<span class="text-base md:text-lg">Card Battle</span>
				</div>
			</Button>
		{/if}
	</div>

	{#await data.lazy.data}
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
	{:then [matches, ogMatches, sections, maxSets, rubrics]}
		{#if matches && ogMatches}
			{#if selectedMatchType === 'arnis'}
				<ArnisTable form={data.form} {matches} {rubrics} />
			{:else if selectedMatchType === 'card_battle'}
				<CardBattleTable matches={ogMatches} />
			{:else}
				<Alert.Root variant="destructive">
					<AlertCircle class="h-4 w-4" />
					<Alert.Title>Not Found</Alert.Title>
					<Alert.Description>Unknown match type.</Alert.Description>
				</Alert.Root>
			{/if}
		{:else}
			<Alert.Root variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description
					>Failed to fetch matches. Please check your connection or try again later.</Alert.Description
				>
			</Alert.Root>
		{/if}
	{/await}
</div>
