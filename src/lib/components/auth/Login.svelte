<script lang="ts">
	import type { Section } from '$lib/types';

	export let sections: Section[] | undefined;

	let willRegister = false;
</script>

<div class="flex flex-col lg:flex-row items-center justify-evenly w-full">
	<h1
		class="mb-10 select-none text-center font-gt-walsheim-pro-medium text-5xl uppercase md:text-7xl 2xl:text-9xl"
	>
		Kali Kalihim
	</h1>
	<div class="variant-soft-surface rounded-md p-4">
		{#if willRegister}
			<div class="flex flex-col gap-4">
				<form class="contents" method="post" action="?/register">
					<label class="label">
						<span>Email</span>
						<input class="input variant-form-material" type="email" placeholder="Aa" name="email" />
					</label>

					<label class="label">
						<span>Password</span>
						<input
							class="input variant-form-material"
							type="password"
							placeholder="Aa"
							name="password"
						/>
					</label>

					<label class="label">
						<span>First Name</span>
						<input
							class="input variant-form-material"
							type="text"
							placeholder="eg. Ayaka"
							name="first-name"
							required
						/>
					</label>

					<label class="label">
						<span>Last Name</span>
						<input
							class="input variant-form-material"
							type="text"
							placeholder="eg. Kamisato"
							name="last-name"
							required
						/>
					</label>

					<label class="label">
						<span>Age</span>
						<input
							class="input variant-form-material"
							type="text"
							placeholder="eg. 18"
							name="age"
							required
						/>
					</label>

					<label class="label">
						<span>Sex</span>
						<select class="select variant-form-material" value="male" name="sex" required>
							<option value="male">Male</option>
							<option value="female">Female</option>
						</select>
					</label>

					<label class="label">
						<span>Section</span>
						<select class="select variant-form-material" name="section" required>
							{#if sections}
								{#each sections as section, idx (idx)}
									<option value={section.id}>{section.name}</option>
								{/each}
							{/if}
						</select>
					</label>

					<label class="label">
						<span>Contact No.</span>
						<input
							class="input variant-form-material"
							type="tel"
							placeholder="eg. 09123456789"
							name="contact-number"
							required
						/>
					</label>

					<button class="variant-filled-primary btn w-full">
						<span class="text-lg">Sign Up</span>
					</button>
				</form>
				<p>
					Have an account?
					<button class="font-bold underline" on:click={() => (willRegister = false)}
						>Sign In</button
					>
				</p>
			</div>
		{:else}
			<div class="flex h-full w-full items-center">
				<div class="flex h-full w-full flex-col items-center justify-center">
					<div class="flex flex-col gap-4">
						<form class="contents" method="post" action="?/login">
							<div>
								<label class="label text-lg">
									<span>Email</span>
									<input
										class="input variant-form-material"
										type="email"
										name="email"
										placeholder="Aa"
										required
									/>
								</label>

								<label class="label text-lg">
									<span>Password</span>
									<input
										class="input variant-form-material"
										type="password"
										name="password"
										placeholder="Aa"
										required
									/>
								</label>
							</div>
							<button class="btn variant-filled-primary w-full">
								<span class="text-lg">Sign In</span>
							</button>
						</form>
						<p class="text-center">
							Don't have an account?
							<button class="font-bold underline" on:click={() => (willRegister = true)}
								>Sign Up</button
							>
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
