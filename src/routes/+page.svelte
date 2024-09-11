<script lang="ts">
	import {
		Badges,
		Banner,
		MatchHistory,
		PowerCards,
		Rank,
		UpcomingMatch,
		UserAvatar
	} from '$lib/components/index';
	import LoginForm from './login-form.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';

	export let data;

	$: ({ session, user } = data);
</script>

{#if session && user}
	<Banner {user} isCurrentUser={true} />
	<UserAvatar {user} isCurrentUser={true} />

	<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
		<Rank {user} />
		{#await data.lazy.data}
			<Skeleton class="min-h-20" />
			<Skeleton class="min-h-20" />
			<Skeleton class="min-h-20" />
		{:then [powerCards, matches, opponentDetails, ogMatches, badges]}
			<UpcomingMatch {matches} userId={user.id} {opponentDetails} />
			<PowerCards {powerCards} isCurrentUser={true} {user} {matches} />
			<MatchHistory {matches} userId={user.id} {ogMatches} />
			<Badges {badges} currentUser={user} {user} />
		{/await}
	</div>
{:else}
	<div class="flex w-full h-full">
		<!-- <div class="w-1/2 bg-card"></div> -->
		<div class="max-w-sm w-full m-auto">
			<LoginForm form={data.form} />
		</div>
	</div>
{/if}
