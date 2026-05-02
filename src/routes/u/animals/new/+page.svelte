<script lang="ts">
	import Input from '$lib/components/ui/form/input/Input';
	import Message from '$lib/components/ui/form/message/Message.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';
	import { ArrowLeft } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { form, errors, constraints, enhance } = superForm(data.form, { delayMs: 500 });

	const species_list = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other'];
	const sex_list = [{ value: 'unknown', label: 'Unknown' }, { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }];
	const vaccination_list = [
		{ value: 'unknown', label: 'Unknown' },
		{ value: 'up-to-date', label: 'Up to date' },
		{ value: 'overdue', label: 'Overdue' }
	];
</script>

<svelte:head><title>EasyVet - Register Animal</title></svelte:head>

<div class="h-full w-full max-w-2xl">
	<form class="flex h-full w-full flex-col gap-4" action="?/new" method="POST" use:enhance novalidate>
		<div class="flex items-center gap-3">
			<a href={resolve('/u/animals')} class="btn btn-ghost btn-sm gap-1">
				<ArrowLeft class="size-4" />
			</a>
			<h1 class="text-xl font-bold">Register Animal</h1>
		</div>

		<div class="flex min-h-0 grow flex-col gap-2 overflow-y-auto">
			<!-- Animal Identity -->
			<section class="card grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				in:fly={{ y: 20, duration: 400, delay: 0 }}>
				<div class="col-span-full">
					<span class="font-bold">Animal Details</span>
				</div>

				<div class="col-span-2">
					<Input.Text name="name" label="Animal Name" errors={$errors.name}
						bind:value={$form.name} constraints={$constraints.name} required={$constraints.name?.required}>
						<Message message={$errors.name} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5">
							<span>Owner (Customer)</span>
							<span class="text-error">*</span>
						</legend>
						<select name="customer_id" class="select select-sm w-full" bind:value={$form.customer_id}>
							<option value="">Select customer...</option>
							{#each data.customers as c}
								<option value={c._id}>{c.firstname} {c.lastname}</option>
							{/each}
						</select>
						<Message message={$errors.customer_id} />
					</fieldset>
				</div>

				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5"><span>Species</span><span class="text-error">*</span></legend>
						<select name="species" class="select select-sm w-full" bind:value={$form.species}>
							{#each species_list as s}
								<option value={s} class="capitalize">{s}</option>
							{/each}
						</select>
						<Message message={$errors.species} />
					</fieldset>
				</div>

				<div class="col-span-2">
					<Input.Text name="breed" label="Breed" errors={$errors.breed}
						bind:value={$form.breed} constraints={$constraints.breed} required={$constraints.breed?.required}>
						<Message message={$errors.breed} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Date name="dob" label="Date of Birth" errors={$errors.dob}
						bind:value={$form.dob} constraints={$constraints.dob} required={$constraints.dob?.required}>
						<Message message={$errors.dob} />
					</Input.Date>
				</div>

				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5"><span>Sex</span></legend>
						<select name="sex" class="select select-sm w-full" bind:value={$form.sex}>
							{#each sex_list as s}
								<option value={s.value}>{s.label}</option>
							{/each}
						</select>
					</fieldset>
				</div>

				<div class="col-span-2">
					<Input.Text name="color" label="Color / Markings" errors={$errors.color}
						bind:value={$form.color} constraints={$constraints.color} required={false}>
						<Message message={$errors.color} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="microchip_id" label="Microchip ID" errors={$errors.microchip_id}
						bind:value={$form.microchip_id} constraints={$constraints.microchip_id} required={false}>
						<Message message={$errors.microchip_id} />
					</Input.Text>
				</div>

				<div class="col-span-2 flex items-center gap-2 pt-2">
					<input type="checkbox" id="is_neutered" name="is_neutered" class="checkbox checkbox-sm checkbox-primary"
						bind:checked={$form.is_neutered} />
					<label for="is_neutered" class="text-sm">Neutered / Spayed</label>
				</div>
			</section>

			<!-- Health Info -->
			<section class="card mt-2 grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				in:fly={{ y: 20, duration: 400, delay: 100 }}>
				<div class="col-span-full">
					<span class="font-bold">Health Information</span>
				</div>

				<div class="col-span-2">
					<Input.Number name="initial_weight_kg" label="Initial Weight (kg)" errors={$errors.initial_weight_kg}
						bind:value={$form.initial_weight_kg} constraints={$constraints.initial_weight_kg} required={false}>
						<Message message={$errors.initial_weight_kg} />
					</Input.Number>
				</div>

				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5"><span>Vaccination Status</span></legend>
						<select name="vaccination_status" class="select select-sm w-full" bind:value={$form.vaccination_status}>
							{#each vaccination_list as v}
								<option value={v.value}>{v.label}</option>
							{/each}
						</select>
					</fieldset>
				</div>

				<div class="col-span-full">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5"><span>Known Allergies</span></legend>
						<input type="text" name="allergies" placeholder="e.g. penicillin, flea medication (comma-separated)"
							class="input input-sm w-full" bind:value={$form.allergies} />
						<p class="text-xs text-base-content/40">Separate multiple allergies with commas</p>
					</fieldset>
				</div>
			</section>
		</div>

		<div class="flex w-full flex-row items-center justify-end gap-2">
			<a href={resolve('/u/animals')} class="btn btn-ghost btn-md">Cancel</a>
			<button class="btn btn-md btn-primary" type="submit">Register Animal</button>
		</div>
	</form>
</div>
