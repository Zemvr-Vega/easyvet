<script lang="ts">
	import Input from '$lib/components/ui/form/input/Input';
	import Message from '$lib/components/ui/form/message/Message.svelte';
	import Tooltip from '$lib/components/ui/Tooltip.svelte';
	import { superForm } from 'sveltekit-superforms/client';
	import { fly } from 'svelte/transition';
	import { resolve } from '$app/paths';
	import { toast } from '$lib/stores/toast';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { form, errors, constraints, enhance } = superForm(data.form, {
		delayMs: 300,
		onUpdated({ form }) {
			if (form.message?.type === 'success') toast.success('Animal registered successfully.');
			if (form.message?.type === 'error')
				toast.error(form.message.message ?? 'Registration failed.');
		}
	});

	const species_list = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other'];
	const sex_list = [
		{ value: 'unknown', label: 'Unknown' },
		{ value: 'male', label: 'Male' },
		{ value: 'female', label: 'Female' }
	];
	const vaccination_list = [
		{ value: 'unknown', label: 'Unknown' },
		{ value: 'up-to-date', label: 'Up to date' },
		{ value: 'overdue', label: 'Overdue' }
	];
</script>

<svelte:head><title>EasyVet — Register Animal</title></svelte:head>

<div class="flex h-full w-full flex-col items-center overflow-y-auto p-6">
	<form
		class="flex w-full max-w-2xl flex-col gap-5"
		action="?/new"
		method="POST"
		use:enhance
		novalidate
	>
		<!-- Animal Identity -->
		<section
			class="ev-panel grid w-full grid-cols-4 gap-x-3 gap-y-4 p-5"
			in:fly={{ y: 16, duration: 320, delay: 0 }}
		>
			<div class="col-span-full mb-1 flex items-center gap-2">
				<span class="font-bold text-base-content">Animal Details</span>
				<Tooltip tip="Basic information of the pet or animal" />
			</div>

			<div class="col-span-2">
				<Input.Text
					name="name"
					label="Animal Name"
					errors={$errors.name}
					bind:value={$form.name}
					constraints={$constraints.name}
					required={$constraints.name?.required}
				>
					<Message message={$errors.name} />
				</Input.Text>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<div>
						<label class="label" for="customer_id">
							Owner (Customer)
							<span class="ml-0.5 text-error">*</span>
						</label>
						<Tooltip
							tip="Select the pet owner from registered customers. If not found, add them in Customers first."
							position="left"
						/>
					</div>
					<select
						id="customer_id"
						name="customer_id"
						class="select w-full select-sm"
						bind:value={$form.customer_id}
					>
						<option value="">Select customer...</option>
						{#each data.customers as c, i (i)}
							<option value={c._id}>{c.firstname} {c.lastname}</option>
						{/each}
					</select>
					<Message message={$errors.customer_id} />
				</fieldset>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<label class="label" for="species">Species <span class="ml-0.5 text-error">*</span></label
					>
					<select
						id="species"
						name="species"
						class="select w-full select-sm"
						bind:value={$form.species}
					>
						{#each species_list as s, i (i)}
							<option value={s} class="capitalize">{s}</option>
						{/each}
					</select>
					<Message message={$errors.species} />
				</fieldset>
			</div>

			<div class="col-span-2">
				<Input.Text
					name="breed"
					label="Breed"
					errors={$errors.breed}
					bind:value={$form.breed}
					constraints={$constraints.breed}
					required={$constraints.breed?.required}
				>
					<Message message={$errors.breed} />
				</Input.Text>
			</div>

			<div class="col-span-2">
				<Input.Date
					name="dob"
					label="Date of Birth"
					errors={$errors.dob}
					bind:value={$form.dob}
					constraints={$constraints.dob}
					required={$constraints.dob?.required}
				>
					<Message message={$errors.dob} />
				</Input.Date>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<label class="label" for="sex">Sex</label>
					<select id="sex" name="sex" class="select w-full select-sm" bind:value={$form.sex}>
						{#each sex_list as s, i (i)}
							<option value={s.value}>{s.label}</option>
						{/each}
					</select>
				</fieldset>
			</div>

			<div class="col-span-2">
				<Input.Text
					name="color"
					label="Color / Markings"
					errors={$errors.color}
					bind:value={$form.color}
					constraints={$constraints.color}
					required={false}
				>
					<Message message={$errors.color} />
				</Input.Text>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<div>
						<label class="label" for="microchip_id"> Microchip ID </label>
						<Tooltip tip="Scan with a chip reader or enter manually." />
					</div>
					<input
						id="microchip_id"
						name="microchip_id"
						type="text"
						class="input input-sm w-full"
						placeholder="e.g. 900182000123456"
						bind:value={$form.microchip_id}
					/>
					<Message message={$errors.microchip_id} />
				</fieldset>
			</div>

			<div class="col-span-2 flex items-center gap-2 pt-1">
				<input
					type="checkbox"
					id="is_neutered"
					name="is_neutered"
					class="checkbox checkbox-sm checkbox-primary"
					bind:checked={$form.is_neutered}
				/>
				<label for="is_neutered" class="cursor-pointer text-sm text-base-content/80 select-none">
					Neutered / Spayed
				</label>
				<Tooltip
					tip="Tick this box if the animal has been spayed or neutered. May affect treatment protocols."
				/>
			</div>
		</section>

		<!-- Health Info -->
		<section
			class="ev-panel grid w-full grid-cols-4 gap-x-3 gap-y-4 p-5"
			in:fly={{ y: 16, duration: 320, delay: 80 }}
		>
			<div class="col-span-full mb-1 flex items-center gap-2">
				<span class="font-bold text-base-content">Health Information</span>
				<Tooltip
					tip="Initial health data recorded at registration. Weight and vaccination status can be updated later."
				/>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<label class="label" for="initial_weight_kg">
						Initial Weight (kg)
						<Tooltip
							tip="Current body weight in kilograms. Used as the baseline for weight history tracking."
						/>
					</label>
					<input
						id="initial_weight_kg"
						name="initial_weight_kg"
						type="number"
						step="0.01"
						min="0.01"
						max="999"
						class="input input-sm w-full"
						placeholder="e.g. 5.2"
						bind:value={$form.initial_weight_kg}
					/>
					<Message message={$errors.initial_weight_kg} />
				</fieldset>
			</div>

			<div class="col-span-2">
				<fieldset class="fieldset w-full">
					<label class="label" for="vaccination_status">
						Vaccination Status
						<Tooltip
							tip="Up to date: all core vaccines current. Overdue: past due date. Unknown: no records available."
						/>
					</label>
					<select
						id="vaccination_status"
						name="vaccination_status"
						class="select w-full select-sm"
						bind:value={$form.vaccination_status}
					>
						{#each vaccination_list as v, i (i)}
							<option value={v.value}>{v.label}</option>
						{/each}
					</select>
				</fieldset>
			</div>

			<div class="col-span-full">
				<fieldset class="fieldset w-full">
					<label class="label" for="allergies">
						Known Allergies
						<Tooltip
							tip="Enter known drug or food allergies separated by commas. These will appear as warnings during treatment."
						/>
					</label>
					<input
						id="allergies"
						name="allergies"
						type="text"
						class="input input-sm w-full"
						placeholder="e.g. penicillin, flea medication, chicken"
						bind:value={$form.allergies}
					/>
					<p class="mt-1 text-[0.68rem] text-base-content/38">
						Separate multiple allergies with commas
					</p>
				</fieldset>
			</div>
		</section>

		<div class="flex w-full flex-row items-center justify-end gap-2 pb-2">
			<a href={resolve('/u/animals')} class="btn btn-ghost btn-sm">Cancel</a>
			<button class="btn btn-sm btn-primary" type="submit">Register Animal</button>
		</div>
	</form>
</div>
