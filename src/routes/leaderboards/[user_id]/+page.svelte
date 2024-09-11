<script lang="ts">
	import { Badges, Banner, PowerCards, Rank, UserAvatar } from '$lib/components';
	import * as Dialog from '$lib/components/ui/dialog';
	import UpdateUserForm from './update-user-form.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { buttonVariants } from '$lib/components/ui/button';
	import { AlertCircle, PenSquare } from 'lucide-svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { isResult } from '$lib/helpers';

	export let data;
</script>

{#await data.lazy.userData}
	<Skeleton class="h-96" />
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
		<Skeleton class="h-80" />
		<Skeleton class="h-80" />
	</div>
{:then [user, powerCards, badges]}
	{#if user}
		<Banner {user} isCurrentUser={isResult(user) ? false : user.id === data.user?.id} />
		<UserAvatar {user} isCurrentUser={isResult(user) ? false : user.id === data.user?.id} />

		<div class="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
			<Rank {user} />

			{#if powerCards}
				<PowerCards
					{powerCards}
					{user}
					isCurrentUser={isResult(user) ? false : user.id === data.user?.id}
				/>
			{/if}

			<Badges {badges} user={isResult(user) ? undefined : user} currentUser={data.user} />
		</div>

		<Dialog.Root closeOnOutsideClick={false}>
			<Dialog.Trigger
				class={`fixed bottom-10 right-[5%] shadow-dark flex items-center gap-1 h-auto ${buttonVariants(
					{
						variant: 'default'
					}
				)}`}
			>
				<PenSquare class="h-5 w-5" />
				<span class="text-base md:text-lg"> Edit </span>
			</Dialog.Trigger>

			<Dialog.Overlay class="z-[70]" />
			<Dialog.Content class="max-h-[90svh] h-full overflow-y-auto z-[100]">
				<Dialog.Header>
					<Dialog.Title>Edit user information</Dialog.Title>
					<Dialog.Description>
						Input the new values you wish to update, leave it blank otherwise.
					</Dialog.Description>
				</Dialog.Header>

				{#await data.sections}
					Loading...
				{:then sections}
					<UpdateUserForm form={data.form} {sections} currentUserData={user} />
				{:catch err}
					<Alert.Root variant="destructive">
						<AlertCircle class="h-4 w-4" />
						<Alert.Title>Error</Alert.Title>
						<Alert.Description>
							<p>Failed to fetch sections.</p>
							<p>{err}</p>
						</Alert.Description>
					</Alert.Root>
				{/await}
			</Dialog.Content>
		</Dialog.Root>
	{/if}
{:catch err}
	<Alert.Root variant="destructive">
		<AlertCircle class="h-4 w-4" />
		<Alert.Title>Error</Alert.Title>
		<Alert.Description>
			<p>Failed to fetch user data.</p>
			<p>{err}</p>
		</Alert.Description>
	</Alert.Root>
{/await}
