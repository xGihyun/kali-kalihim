<script lang="ts">
	import { getRankTitle } from '$lib';
	import type { Badge, Result, User } from '$lib/types';
	import * as Card from '$lib/components/ui/card';
	import { RankLogo } from '.';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircle } from 'lucide-svelte';
	import { isResult } from '$lib/helpers';

	export let user: User | Result;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title class="text-2xl md:text-4xl font-normal font-jost-bold">Performance</Card.Title>
	</Card.Header>
	<Card.Content class="flex px-0 relative flex-col">
		{#if isResult(user)}
			<Alert.Root variant="destructive">
				<AlertCircle class="h-4 w-4" />
				<Alert.Title>Error</Alert.Title>
				<Alert.Description>
					<p>Failed to fetch user.</p>
					<p>{user.message}</p>
				</Alert.Description>
			</Alert.Root>
		{:else}
			<div class="flex flex-1 items-center gap-6 relative py-6 pl-9 pr-6 h-32">
				<div
					class="absolute left-0 top-0 w-full h-full transform-gpu animate-gradient-x bg-gradient-to-r from-blue-950 to-rose-950 bg-[size:200%] z-10"
				/>

				<!-- <div class="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-card z-[60]"></div> -->
				<RankLogo
					title={getRankTitle(user.score)}
					width="lg:h-20 h-16"
					containerWidth="lg:h-20 h-16"
					showContainer={true}
				/>

				<span class="font-jost-semibold text-xl md:text-3xl uppercase flex-1 relative z-20"
					>{getRankTitle(user.score)}</span
				>
			</div>

			<div class="grid grid-cols-3 px-6 py-6 gap-2">
				<Card.Root class="px-3 py-2 bg-background flex items-center border-border/75">
					<Card.Content class="p-0">
						<h4 class="text-muted-foreground text-sm md:text-base">Score</h4>
						<span class="text-xl md:text-2xl font-jost-medium">{user.score}</span>
					</Card.Content>
				</Card.Root>

				<Card.Root class="px-3 py-2 bg-background flex items-center border-border/75">
					<Card.Content class="p-0">
						<h4 class="text-muted-foreground text-sm md:text-base">Overall</h4>
						<span class="text-xl md:text-2xl font-jost-medium">#{user.rank_overall}</span>
					</Card.Content>
				</Card.Root>

				<Card.Root class="px-3 py-2 bg-background flex items-center border-border/75">
					<Card.Content class="p-0">
						<h4 class="text-muted-foreground text-sm md:text-base">Section</h4>
						<span class="text-xl md:text-2xl font-jost-medium">#{user.rank_section}</span>
					</Card.Content>
				</Card.Root>
			</div>
		{/if}
	</Card.Content>
</Card.Root>
