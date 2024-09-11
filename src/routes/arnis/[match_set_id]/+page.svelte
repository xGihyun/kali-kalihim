<script lang="ts">
	import { getOpponent } from '$lib';
	import { Separator } from '$lib/components/ui/separator';
	import * as Table from '$lib/components/ui/table';

	export let data;

	// Received Score
	// DES count
	// AP count
	// Score difference
	// Final Score

	$: ({ match } = data);
</script>

{#if match}
	{@const user1Score =
		match.user1_id === data.user?.id ? match.user1_score || 0 : match.user2_score || 0}
	{@const user2Score =
		match.user1_id !== data.user?.id ? match.user1_score || 0 : match.user2_score || 0}
	{@const difference = Math.abs(user1Score - user2Score)}
	{@const desCount1 =
		match.user1_id === data.user?.id ? match.user1_des_count : match.user2_des_count}
	{@const desCount2 =
		match.user1_id !== data.user?.id ? match.user1_des_count : match.user2_des_count}
	{@const apCount1 = match.user1_id === data.user?.id ? match.user1_ap_count : match.user2_ap_count}
	{@const apCount2 = match.user1_id !== data.user?.id ? match.user1_ap_count : match.user2_ap_count}
	{@const verdict1 =
		match.user1_id === data.user?.id ? match.user1_arnis_verdict : match.user2_arnis_verdict}
	{@const verdict2 =
		match.user1_id !== data.user?.id ? match.user1_arnis_verdict : match.user2_arnis_verdict}
	{@const finalScore1 =
		verdict1 === 'win'
			? user1Score + difference
			: verdict1 === 'lose'
				? user1Score - difference
				: user1Score}
	{@const finalScore2 =
		verdict2 === 'win'
			? user2Score + difference
			: verdict2 === 'lose'
				? user2Score - difference
				: user2Score}

	<Table.Root>
		<Table.Header>
			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Head>Data</Table.Head>
				<Table.Head class="text-primary/80 font-jost-semibold"
					>{data.user?.first_name} {data.user?.last_name} (You)</Table.Head
				>
				<Table.Head>{getOpponent(data.user?.id, data.match).name}</Table.Head>
			</Table.Row>
		</Table.Header>
		<Table.Body>
			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Cell class="text-sm sm:text-base md:text-lg font-jost-medium"
					>Received Score</Table.Cell
				>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					{user1Score}
				</Table.Cell>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					{user2Score}
				</Table.Cell>
			</Table.Row>

			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Cell class="text-sm sm:text-base md:text-lg font-jost-medium"
					>Double-edged Swords Used</Table.Cell
				>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					<span class={desCount1 > 0 ? 'text-blue-500' : 'text-muted-foreground'}>
						{desCount1}
					</span>
				</Table.Cell>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					<span class={desCount2 > 0 ? 'text-blue-500' : 'text-muted-foreground'}>
						{desCount2}
					</span>
				</Table.Cell>
			</Table.Row>

			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Cell class="text-sm sm:text-base md:text-lg font-jost-medium"
					>Ancient's Protections Used</Table.Cell
				>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					<span class={apCount1 > 0 ? 'text-blue-500' : 'text-muted-foreground'}>
						{apCount1}
					</span>
				</Table.Cell>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					<span class={apCount2 > 0 ? 'text-blue-500' : 'text-muted-foreground'}>
						{apCount2}
					</span>
				</Table.Cell>
			</Table.Row>

			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Cell
					class="text-sm sm:text-base md:text-lg font-jost-medium flex flex-col md:flex-row md:gap-4 md:items-center"
					>Score Difference

					<span class="text-muted-foreground sm:text-xs md:text-base">
						|{user1Score} - {user2Score}|
					</span>
				</Table.Cell>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					{#if desCount1 > 0}
						<strike>
							{difference}
						</strike>
						<span class="text-blue-500 ml-2">
							{difference * 2 * desCount1}
						</span>
					{:else}
						{difference}
					{/if}
				</Table.Cell>

				<Table.Cell class="text-sm sm:text-base md:text-lg">
					{#if desCount2 > 0}
						<strike>
							{difference}
						</strike>
						<span class="text-blue-500 ml-2">
							{difference * 2 * desCount2}
						</span>
					{:else}
						{difference}
					{/if}
				</Table.Cell>
			</Table.Row>

			<Table.Row class="text-sm sm:text-base md:text-lg">
				<Table.Cell
					class="text-sm sm:text-base md:text-lg font-jost-medium flex flex-col md:flex-row md:gap-4 md:items-center"
				>
					Final Score

					<span class="text-muted-foreground sm:text-xs md:text-base"> Received ± Difference </span>
				</Table.Cell>

				<Table.Cell
					class={`text-sm sm:text-base md:text-lg font-jost-medium ${
						verdict1 === 'win'
							? 'text-green-500'
							: verdict1 === 'lose'
								? 'text-red-600'
								: 'text-yellow-500'
					}`}
				>
					{#if apCount1 > 0}
						<span class="text-foreground line-through">
							{desCount1 > 0 ? user1Score + difference * 2 * desCount1 : finalScore1}
						</span>
						<span class="ml-2 font-jost-medium">
							{user1Score}
						</span>
					{:else}
						{desCount1 > 0 ? user1Score + difference * 2 * desCount1 : finalScore1}
					{/if}
				</Table.Cell>

				<Table.Cell
					class={`text-sm sm:text-base md:text-lg font-jost-medium ${
						verdict2 === 'win'
							? 'text-green-500'
							: verdict2 === 'lose'
								? 'text-red-600'
								: 'text-yellow-500'
					}`}
				>
					{#if apCount2 > 0}
						<span class="text-foreground line-through">
							{desCount2 > 0 ? user2Score + difference * 2 * desCount2 : finalScore2}
						</span>
						<span class="ml-2 font-jost-medium">
							{user2Score}
						</span>
					{:else}
						{desCount2 > 0 ? user2Score + difference * 2 * desCount2 : finalScore2}
					{/if}
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>

	<Separator />

	<div>
		<h4 class="text-xl font-jost-medium mb-4">Comment</h4>

		<p>{match.comment}</p>
	</div>
{/if}
