<script lang="ts">
	import type { LatestOpponent, Matchmake, Result } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircle } from 'lucide-svelte';
	import { getRankTitle, snakeCaseToTitleCase } from '$lib';
	import { isResult } from '$lib/helpers';

	export let matches: Matchmake[] | null | Result;
	export let userId: string;
	export let opponentDetails: LatestOpponent | null | Result;

	function getOpponent(match: Matchmake | undefined): {
		id: string | undefined;
		name: string | undefined;
	} {
		if (!match)
			return {
				id: undefined,
				name: undefined
			};

		if (userId === match.user1_id) {
			return {
				id: match.user2_id,
				name: `${match.user2_first_name} ${match.user2_last_name}`
			};
		}

		return {
			id: match.user1_id,
			name: `${match.user1_first_name} ${match.user1_last_name}`
		};
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl md:text-4xl font-normal font-jost-bold">Upcoming Match</Card.Title>
	</Card.Header>

	{#if isResult(opponentDetails)}
		<Alert.Root variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>
				<p>Failed to fetch opponent.</p>
				<p>{opponentDetails.message}</p>
			</Alert.Description>
		</Alert.Root>
	{:else if isResult(matches)}
		<Alert.Root variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<Alert.Title>Error</Alert.Title>
			<Alert.Description>
				<p>Failed to fetch matcheses.</p>
				<p>{matches.message}</p>
			</Alert.Description>
		</Alert.Root>
	{:else if matches && matches[0] && opponentDetails && matches[0].status === 'pending'}
		{@const initials = (
			opponentDetails?.first_name[0] + opponentDetails?.last_name[0]
		).toUpperCase()}
		<Card.Content class="px-0 flex flex-col w-full relative ">
			<div class="relative px-6 py-6 flex-1">
				{#if opponentDetails.banner_url}
					<img
						src={opponentDetails.banner_url}
						alt="Banner"
						class="absolute left-0 top-0 object-cover w-full h-full brightness-[.25]"
					/>
				{:else}
					<div class="absolute left-0 top-0 w-full h-full bg-slate-900"></div>
				{/if}

				<div class="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-card"></div>

				<div class="flex items-center gap-4 justify-between">
					<div class="relative flex items-center gap-4 z-20">
						<Avatar.Root class="text-xl md:text-2xl w-16 h-16 lg:w-20 lg:h-20 shadow-light">
							<Avatar.Image src={opponentDetails.avatar_url} alt="Avatar" />
							<Avatar.Fallback>{initials}</Avatar.Fallback>
						</Avatar.Root>

						<div>
							<a
								href={`/leaderboards/${getOpponent(matches[0]).id}`}
								class="text-xl font-jost-semibold line-clamp-1 hover:underline"
								>{getOpponent(matches[0]).name}</a
							>
							<div class="text-base text-muted-foreground">
								{getRankTitle(opponentDetails.score)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="grid grid-cols-2 px-6 py-6 gap-2">
				<Card.Root class="px-3 py-2 bg-background flex items-center border-border/75">
					<Card.Content class="p-0">
						<h4 class="text-muted-foreground text-sm md:text-base">Skill</h4>
						<span class="text-base sm:text-xl md:text-2xl font-jost-medium"
							>{snakeCaseToTitleCase(matches[0].arnis_skill)}</span
						>
					</Card.Content>
				</Card.Root>
			</div>
		</Card.Content>
	{:else}
		<Card.Content>
			<p class="text-muted-foreground italic">
				No upcoming match yet, please wait for the admin to queue.
			</p>
		</Card.Content>
	{/if}
</Card.Root>
