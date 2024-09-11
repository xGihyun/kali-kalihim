<script lang="ts">
	import { getOpponent, snakeCaseToTitleCase } from '$lib';
	import * as Table from '$lib/components/ui/table';
	import * as Alert from '$lib/components/ui/alert';
	import { AlertCircle } from 'lucide-svelte';

	export let data;

	$: ({ turns } = data);

	console.log(turns);

	function roundToTwoDecimals(num: number) {
		return Math.round(num * 100) / 100;
	}
</script>

{#if turns}
	<div class="flex gap-8 items-center mb-2">
		<div class="flex items-center gap-2">
			<div class="bg-muted w-4 h-4 rounded-full"></div>
			<span>Blocked</span>
		</div>

		<div class="flex items-center gap-2">
			<div class="bg-destructive w-4 h-4 rounded-full"></div>
			<span>Missed</span>
		</div>
	</div>

	<Table.Root>
		<Table.Header>
			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Head class="text-primary/80 font-jost-semibold"
					>{data.user?.first_name} {data.user?.last_name} (You)</Table.Head
				>
				<Table.Head>Damage</Table.Head>
				<Table.Head>{getOpponent(data.user?.id, data.match).name}</Table.Head>
				<Table.Head>Damage</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each Array(6) as _, idx (idx)}
				<Table.Row class="text-sm sm:text-base md:text-lg">
					{#if turns.user1 && turns.user1[idx].user_id === data.user?.id}
						<Table.Cell class="flex flex-col">
							<!-- Card name -->
							<span class="text-sm sm:text-base md:text-lg font-jost-medium">
								{#if turns.user1 && turns.user1[idx].card_name}
									{snakeCaseToTitleCase(turns.user1[idx].card_name)}
								{:else}
									None
								{/if}
							</span>

							<!-- Card effect -->
							<span class="text-muted-foreground text-sm">
								{#if turns.user1 && turns.user1[idx].card_effect}
									{turns.user1[idx].card_effect}
								{:else}
									None
								{/if}
							</span>
						</Table.Cell>

						<!-- Damage dealt -->
						{#if turns.user1}
							<Table.Cell
								class={`text-lg md:text-xl font-jost-medium ${
									turns.user1[idx].is_cancelled
										? 'text-muted'
										: !turns.user1[idx].is_cancelled &&
											  turns.user1[idx].damage <= 0 &&
											  !turns.user1[idx].card_name.includes('block')
											? 'text-destructive'
											: 'text-foreground'
								}`}>{roundToTwoDecimals(turns.user1[idx].damage)}</Table.Cell
							>
						{:else}
							<Table.Cell class="text-muted-foreground italic">Null</Table.Cell>
						{/if}

						<!-- Opponent card name -->
						<Table.Cell class="flex flex-col">
							<span class="text-sm sm:text-base md:text-lg font-jost-medium">
								{#if turns.user2 && turns.user2[idx].card_name}
									{snakeCaseToTitleCase(turns.user2[idx].card_name)}
								{:else}
									None
								{/if}
							</span>

							<!-- Opponent card effect -->
							<span class="text-muted-foreground text-sm">
								{#if turns.user2 && turns.user2[idx].card_effect}
									{turns.user2[idx].card_effect}
								{:else}
									None
								{/if}
							</span>
						</Table.Cell>

						<!-- Opponent damage dealt -->
						{#if turns.user2}
							<Table.Cell
								class={`text-lg md:text-xl font-jost-medium ${
									turns.user2[idx].is_cancelled
										? 'text-muted'
										: !turns.user2[idx].is_cancelled &&
											  turns.user2[idx].damage <= 0 &&
											  !turns.user2[idx].card_name.includes('block')
											? 'text-destructive'
											: 'text-foreground'
								}`}>{roundToTwoDecimals(turns.user2[idx].damage)}</Table.Cell
							>
						{:else}
							<Table.Cell class="text-muted-foreground italic">Null</Table.Cell>
						{/if}
					{:else}
						<Table.Cell class="flex flex-col">
							<span class="text-sm sm:text-base md:text-lg font-jost-medium">
								{#if turns.user2 && turns.user2[idx].card_name}
									{snakeCaseToTitleCase(turns.user2[idx].card_name)}
								{:else}
									None
								{/if}
							</span>

							<span class="text-muted-foreground text-sm">
								{#if turns.user2 && turns.user2[idx].card_effect}
									{turns.user2[idx].card_effect}
								{:else}
									None
								{/if}
							</span>
						</Table.Cell>
						{#if turns.user2}
							<Table.Cell
								class={`text-lg md:text-xl font-jost-medium ${
									turns.user2[idx].is_cancelled
										? 'text-muted'
										: !turns.user2[idx].is_cancelled &&
											  turns.user2[idx].damage <= 0 &&
											  !turns.user2[idx].card_name.includes('block')
											? 'text-destructive'
											: 'text-foreground'
								}`}>{roundToTwoDecimals(turns.user2[idx].damage)}</Table.Cell
							>
						{:else}
							<Table.Cell class="text-muted-foreground italic">Null</Table.Cell>
						{/if}

						<Table.Cell class="flex flex-col">
							<span class="text-sm sm:text-base md:text-lg font-jost-medium">
								{#if turns.user1 && turns.user1[idx].card_name}
									{snakeCaseToTitleCase(turns.user1[idx].card_name)}
								{:else}
									None
								{/if}
							</span>

							<span class="text-muted-foreground text-sm">
								{#if turns.user1 && turns.user1[idx].card_effect}
									{turns.user1[idx].card_effect}
								{:else}
									None
								{/if}
							</span>
						</Table.Cell>

						{#if turns.user1}
							<Table.Cell
								class={`text-lg md:text-xl font-jost-medium ${
									turns.user1[idx].is_cancelled
										? 'text-muted'
										: !turns.user1[idx].is_cancelled &&
											  turns.user1[idx].damage <= 0 &&
											  !turns.user1[idx].card_name.includes('block')
											? 'text-destructive'
											: 'text-foreground'
								}`}>{roundToTwoDecimals(turns.user1[idx].damage)}</Table.Cell
							>
						{:else}
							<Table.Cell class="text-muted-foreground italic">Null</Table.Cell>
						{/if}
					{/if}
				</Table.Row>
			{/each}
		</Table.Body>
	</Table.Root>
{:else}
	<Alert.Root variant="destructive">
		<AlertCircle class="h-4 w-4" />
		<Alert.Title>Error</Alert.Title>
		<Alert.Description
			>Failed to fetch card battle. Please check your connection or try again later.</Alert.Description
		>
	</Alert.Root>
{/if}
