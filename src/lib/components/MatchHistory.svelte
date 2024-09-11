<script lang="ts">
	// import { pushState } from '$app/navigation';
	import {
		getOpponent,
		getUserCardBattleVerdict,
		getUserVerdict,
		snakeCaseToTitleCase
	} from '$lib';
	import type { Matchmake, Result } from '$lib/types';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { goto, preloadData, pushState } from '$app/navigation';
	import CardBattle from '../../routes/card-battle/[match_set_id]/+page.svelte';
	import ArnisMatch from '../../routes/arnis/[match_set_id]/+page.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircle } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { isResult } from '$lib/helpers';

	export let matches: Matchmake[] | Result;
	export let ogMatches: Matchmake[] | Result;
	export let userId: string;

	let cardBattleIsOpen = false;
	let arnisMatchIsOpen = false;

	async function showModal(e: MouseEvent, match: Matchmake, type: 'arnis' | 'card_battle') {
		const { href } = e.currentTarget as HTMLAnchorElement;

		const result = await preloadData(href);

		if (result.type === 'loaded' && result.status === 200) {
			pushState(href, { selected: { turns: result.data.turns, user: result.data.user, match } });

			if (type === 'arnis') {
				arnisMatchIsOpen = true;
			} else {
				cardBattleIsOpen = true;
			}
		} else {
			goto(href);
		}
	}
</script>

<Dialog.Root
	open={cardBattleIsOpen}
	onOpenChange={(open) => {
		cardBattleIsOpen = open;
		history.back();
	}}
	closeOnOutsideClick={false}
>
	<Dialog.Content class="max-w-6xl z-[250] overflow-y-auto max-h-[90svh]">
		<Dialog.Header>
			<Dialog.Title class="text-2xl">Card Battle</Dialog.Title>
			<!-- <Dialog.Description class="text-sm sm:text-base">See how the match went</Dialog.Description> -->
		</Dialog.Header>

		{#if $page.state.selected}
			<CardBattle data={$page.state.selected} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root
	open={arnisMatchIsOpen}
	onOpenChange={(open) => {
		arnisMatchIsOpen = open;
		history.back();
	}}
	closeOnOutsideClick={false}
>
	<Dialog.Content class="max-w-6xl z-[250] overflow-y-auto max-h-[90svh]">
		<Dialog.Header>
			<Dialog.Title class="text-2xl font-jost-semibold">Arnis</Dialog.Title>
		</Dialog.Header>

		{#if $page.state.selected}
			<ArnisMatch data={$page.state.selected} />
		{/if}
	</Dialog.Content>
</Dialog.Root>

<Card.Root>
	<Card.Header>
		<Card.Title
			class="text-2xl md:text-4xl font-normal font-jost-bold flex justify-between flex-wrap gap-2"
		>
			Match History

			<div class="flex gap-8 items-center mb-2 text-base flex-wrap">
				<div class="flex items-center gap-2">
					<div class="bg-green-500 w-4 h-4 rounded-full"></div>
					<span class="font-jost-medium">Win</span>
				</div>

				<div class="flex items-center gap-2">
					<div class="bg-yellow-500 w-4 h-4 rounded-full"></div>
					<span class="font-jost-medium">Draw</span>
				</div>

				<div class="flex items-center gap-2">
					<div class="bg-red-600 w-4 h-4 rounded-full"></div>
					<span class="font-jost-medium">Loss</span>
				</div>

				<!-- <div class="flex items-center gap-2"> -->
				<!-- 	<div class="bg-muted-foreground w-4 h-4 rounded-full"></div> -->
				<!-- 	<span class="font-jost-medium">Pending</span> -->
				<!-- </div> -->
			</div>
		</Card.Title>
	</Card.Header>
	<Card.Content>
		{#if isResult(matches)}
			<Alert.Root variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>
					<p>Failed to fetch matches.</p>
					<p>{matches.message}</p>
				</Alert.Description>
			</Alert.Root>
		{:else if isResult(ogMatches)}
			<Alert.Root variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>
					<p>Failed to fetch matches.</p>
					<p>{ogMatches.message}</p>
				</Alert.Description>
			</Alert.Root>
		{:else if matches.length < 1}
			<p class="text-muted-foreground italic">
				History is empty. You will see your previous matches here.
			</p>
		{:else}
			<Tabs.Root value="arnis">
				<Tabs.List>
					<Tabs.Trigger value="arnis">Arnis</Tabs.Trigger>
					<Tabs.Trigger value="card_battle">Card Battle</Tabs.Trigger>
				</Tabs.List>
				<Tabs.Content value="arnis">
					<Table.Root>
						<Table.Header>
							<Table.Row class="text-sm sm:text-base md:text-lg">
								<Table.Head>Opponent</Table.Head>
								<Table.Head>Skill</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each matches as match (match.id)}
								<a
									class="contents"
									href={`/arnis/${match.id}`}
									on:click|preventDefault={(e) => showModal(e, match, 'arnis')}
								>
									<Table.Row class="text-sm sm:text-base md:text-lg">
										<Table.Cell
											class={`w-1/3 bg-gradient-to-r  to-50% border-l-8 ${
												getUserVerdict(userId, match) === 'win'
													? 'border-l-green-500 from-green-900'
													: getUserVerdict(userId, match) === 'lose'
														? 'border-l-red-600 from-red-950'
														: getUserVerdict(userId, match) === 'draw'
															? 'border-l-yellow-500 from-yellow-900'
															: 'border-l-muted-foreground from-muted'
											}`}>{getOpponent(userId, match).name}</Table.Cell
										>
										<Table.Cell class="w-1/4">{snakeCaseToTitleCase(match.arnis_skill)}</Table.Cell>
									</Table.Row>
								</a>
							{/each}
						</Table.Body>
					</Table.Root>
				</Tabs.Content>

				<Tabs.Content value="card_battle">
					<Table.Root>
						<Table.Header>
							<Table.Row class="text-sm sm:text-base md:text-lg">
								<Table.Head>Opponent</Table.Head>
								<Table.Head>DMG Dealt</Table.Head>
								<Table.Head>DMG Taken</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each ogMatches as match, idx (match.id)}
								{@const dmg1 =
									match.og_user1_id === userId
										? match.user1_total_damage
										: match.user2_total_damage}
								{@const dmg2 =
									match.og_user1_id !== userId
										? match.user1_total_damage
										: match.user2_total_damage}

								<a
									class="contents"
									href={`/card-battle/${match.id}`}
									on:click|preventDefault={(e) => showModal(e, match, 'card_battle')}
								>
									<Table.Row class="text-sm sm:text-base md:text-lg">
										<Table.Cell
											class={`w-1/3 bg-gradient-to-r to-50% border-l-8 ${
												getUserCardBattleVerdict(dmg1, dmg2, idx === 0) === 'win'
													? 'border-l-green-500 from-green-900'
													: getUserCardBattleVerdict(dmg1, dmg2, idx === 0) === 'lose'
														? 'border-l-red-600 from-red-950'
														: getUserCardBattleVerdict(dmg1, dmg2, idx === 0) === 'draw'
															? 'border-l-yellow-500 from-yellow-900'
															: 'border-l-muted-foreground from-muted'
											}`}>{getOpponent(userId, match).name}</Table.Cell
										>
										<Table.Cell
											class={`w-1/4 ${dmg1 ? 'text-foreground' : 'text-muted-foreground italic'}`}
										>
											{#if idx === 0 && !dmg1}
												Pending
											{:else if dmg1}
												{dmg1}
											{:else}
												Null
											{/if}
										</Table.Cell>
										<Table.Cell
											class={`w-1/4 ${dmg2 ? 'text-foreground' : 'text-muted-foreground italic'}`}
										>
											{#if idx === 0 && !dmg2}
												Pending
											{:else if dmg2}
												{dmg2}
											{:else}
												Null
											{/if}
										</Table.Cell>
									</Table.Row>
								</a>
							{/each}
						</Table.Body>
					</Table.Root>
				</Tabs.Content>
			</Tabs.Root>
		{/if}
	</Card.Content>
</Card.Root>
