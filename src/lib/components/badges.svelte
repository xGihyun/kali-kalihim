<script lang="ts">
	import { BADGES } from '$lib';
	import * as Card from '$lib/components/ui/card';
	import type { Badge, User } from '$lib/types';
	import { Button } from '$lib/components/ui/button';
	import { Check } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import * as HoverCard from '$lib/components/ui/hover-card';

	export let badges: Badge[];
	export let user: User | undefined;
	export let currentUser: User | undefined;

	let selectedBadges: string[] = badges.map(({ name }) => name);

	console.log(badges);
	console.log(selectedBadges);

	function toggleBadge(badgeName: string): void {
		if (selectedBadges.some((name) => badgeName === name)) {
			selectedBadges = selectedBadges.filter((name) => name !== badgeName);
			return;
		}

		selectedBadges.push(badgeName);
		selectedBadges = selectedBadges;
	}

	async function updateBadges(): Promise<void> {
		const response = await fetch(`/api/badges?user_id=${user?.id}`, {
			method: 'POST',
			body: JSON.stringify(selectedBadges),
			headers: {
				'content-type': 'application/json'
			}
		});

		const message = await response.text();

		if (!response.ok) {
			console.error('Failed to update badges: ', message);
			toast.error(message);

			return;
		}

		toast.success(message);
		await invalidateAll();
	}

	function arraysAreEqual(arr1: string[], arr2: string[]) {
		if (arr1.length !== arr2.length) {
			return false;
		}

		return arr1.every((element) => {
			return arr2.includes(element);
		});
	}
</script>

<Card.Root>
	<Card.Header class="flex items-center flex-row justify-between">
		<Card.Title
			class="text-2xl md:text-4xl font-normal font-jost-bold flex justify-between flex-wrap gap-2 items-center"
		>
			Badges
		</Card.Title>
		{#if currentUser?.role === 'admin'}
			<Button
				variant="ghost"
				class="space-x-1"
				on:click={updateBadges}
				disabled={arraysAreEqual(
					badges.map(({ name }) => name),
					selectedBadges
				)}
			>
				<Check class="w-4 h-4" />
				<span> Apply </span>
			</Button>
		{/if}
	</Card.Header>

	<Card.Content class="flex gap-4 flex-wrap">
		{#each BADGES as badge (badge.name)}
			<HoverCard.Root>
				<HoverCard.Trigger>
					<button
						class={`p-4 rounded-md border-4 border-white transition-[filter] duration-100 ${
							selectedBadges.some((name) => badge.name === name)
								? 'brightness-100'
								: 'brightness-25'
						}`}
						disabled={currentUser?.role === 'user'}
						on:click={() => toggleBadge(badge.name)}
					>
						<svelte:component this={badge.icon} class="w-10 h-10" />
					</button>
				</HoverCard.Trigger>
				<HoverCard.Content class="flex flex-col justify-center gap-5">
					<div class="gap-2 flex flex-col w-full items-center">
						<div class="p-4 rounded-md border-4 border-white w-20 h-20">
							<svelte:component this={badge.icon} class="w-10 h-10" />
						</div>

						<p class="text-2xl text-center">
							{badge.name}
						</p>
					</div>
					<p class="text-sm text-center">
						{badge.description}
					</p>
				</HoverCard.Content>
			</HoverCard.Root>
		{/each}
	</Card.Content>
</Card.Root>
