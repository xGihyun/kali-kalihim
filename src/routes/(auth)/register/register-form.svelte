<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Form from '$lib/components/ui/form';
	import { RegisterSchema } from '$lib/schemas';
	import type { RequestStatus, Section } from '$lib/types';
	import { CheckCircled, CrossCircled, Reload } from 'radix-icons-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import * as Tabs from '$lib/components/ui/tabs';

	export let form: SuperValidated<typeof RegisterSchema>;
	export let sections: Section[];

	let requestStatus: RequestStatus = {
		type: 'none'
	};
</script>

<div class="mb-5">
	<h1 class="text-2xl font-jost-bold text-center">Create an account</h1>
	<p class="text-sm sm:text-base text-center text-muted-foreground">
		Enter the necessary details below.
	</p>
</div>

<Form.Root {form} schema={RegisterSchema} let:config let:attrs>
	<form
		method="POST"
		use:enhance={() => {
			console.log('Registering...');
			requestStatus = {
				type: 'pending'
			};

			return async ({ result }) => {
				console.log('Register result: ');
				console.log(result);

				if (result.type === 'success' || result.type === 'redirect') {
					console.log('Successfully registered.');
					requestStatus = {
						type: 'success',
						code: result.status,
						message: result.data.message
					};
				} else {
					console.error('Error');
					requestStatus = {
						type: 'error',
						code: result.status,
						message: result.data.message
					};
				}
			};
		}}
		{...attrs}
	>
		<!-- <Tabs.Root value="credentials"> -->
		<!-- 	<Tabs.List class="h-auto w-full"> -->
		<!-- 		<Tabs.Trigger value="credentials" class="text-base md:text-lg h-auto w-full" -->
		<!-- 			>Credentials</Tabs.Trigger -->
		<!-- 		> -->
		<!-- 		<Tabs.Trigger value="personal" class="text-base md:text-lg h-auto w-full" -->
		<!-- 			>Personal Information</Tabs.Trigger -->
		<!-- 		> -->
		<!-- 	</Tabs.List> -->
		<!-- 	<Tabs.Content value="credentials"> -->
		<Form.Field {config} name="email">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Email</Form.Label>
				<Form.Input
					type="email"
					placeholder="Enter email (e.g. pangalan@gmail.com)"
					class="text-base md:text-lg h-auto"
					required
				/>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="password">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Password</Form.Label>
				<Form.Input type="password" class="text-base md:text-lg h-auto" required />
				<Form.Validation />
			</Form.Item>
		</Form.Field>
		<!-- </Tabs.Content> -->
		<!-- <Tabs.Content value="personal" class="space-y-4"> -->
		<Form.Field {config} name="first_name">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">First Name</Form.Label>
				<Form.Input
					type="text"
					placeholder="Enter first name (e.g. Crisostomo)"
					class="text-base md:text-lg h-auto"
					required
				/>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="last_name">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Last Name</Form.Label>
				<Form.Input
					type="text"
					placeholder="Enter first name (e.g. Ibarra)"
					class="text-base md:text-lg h-auto"
					required
				/>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="age">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Age</Form.Label>
				<Form.Input type="number" class="text-base md:text-lg h-auto" required />
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="contact_number">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Contact Number</Form.Label>
				<Form.Input
					type="text"
					class="text-base md:text-lg h-auto"
					placeholder="Enter contact number (e.g. 09123456789)"
					required
				/>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="sex">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Sex</Form.Label>
				<Form.Select required>
					<Form.SelectTrigger placeholder="Select your sex" class="text-base md:text-lg h-auto" />
					<Form.SelectContent>
						<Form.SelectItem value={0} class="text-base md:text-lg h-auto">Male</Form.SelectItem>
						<Form.SelectItem value={1} class="text-base md:text-lg h-auto">Female</Form.SelectItem>
					</Form.SelectContent>
				</Form.Select>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<Form.Field {config} name="section">
			<Form.Item>
				<Form.Label class="text-base md:text-lg">Section</Form.Label>
				<Form.Select required>
					<Form.SelectTrigger
						placeholder="Select your section"
						class="text-base md:text-lg h-auto"
					/>
					<Form.SelectContent>
						{#each sections as section (section.id)}
							<Form.SelectItem value={section.id} class="text-base md:text-lg h-auto"
								>{section.name}</Form.SelectItem
							>
						{/each}
					</Form.SelectContent>
				</Form.Select>
				<Form.Validation />
			</Form.Item>
		</Form.Field>

		<div class="flex justify-end w-full mt-10">
			<Form.Button
				class={`text-base md:text-lg h-auto w-full ${
					requestStatus.type === 'success'
						? 'bg-green-500 pointer-events-none'
						: requestStatus.type === 'error'
							? 'bg-red-500 hover:bg-red-600'
							: requestStatus.type === 'pending'
								? 'bg-yellow-500 pointer-events-none'
								: 'bg-primary'
				}`}
			>
				<div class="flex items-center gap-1">
					{#if requestStatus.type === 'pending'}
						<Reload class="h-5 w-5 animate-spin" />
						<span class="text-base md:text-lg">Registering...</span>
					{:else if requestStatus.type === 'success'}
						<CheckCircled class="h-5 w-5 " />
						<span class="text-base md:text-lg">Success. Please check your email.</span>
					{:else if requestStatus.type === 'error'}
						<CrossCircled class="h-5 w-5 " />
						<span class="text-base md:text-lg">
							{requestStatus.message}
						</span>
					{:else}
						<span class="text-base md:text-lg">Register</span>
					{/if}
				</div>
			</Form.Button>
		</div>
		<!-- 	</Tabs.Content> -->
		<!-- </Tabs.Root> -->

		{#if requestStatus.type === 'success'}
			<p class="mt-4">
				<span class="font-jost-semibold">NOTE:</span>
				<br />
				Make sure to open the verification link using the same browser you used to register.
			</p>
		{/if}

		<p class="mt-4 text-center">
			Already have an account?

			<a href="/" class="hover:underline font-jost-semibold text-primary">Login.</a>
		</p>
	</form>
</Form.Root>
