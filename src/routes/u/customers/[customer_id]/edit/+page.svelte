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
</script>

<svelte:head><title>EasyVet - Edit Customer</title></svelte:head>

<div class="h-full w-full max-w-2xl">
	<form class="flex h-full w-full flex-col gap-4" action="?/update" method="POST" use:enhance novalidate>
		<div class="flex items-center gap-3">
			<a href={resolve(`/u/customers/${data.customer_id}`)} class="btn btn-ghost btn-sm gap-1">
				<ArrowLeft class="size-4" />
			</a>
			<h1 class="text-xl font-bold">Edit Customer</h1>
		</div>

		<div class="flex min-h-0 grow flex-col gap-2 overflow-y-auto">
			<!-- Personal Information -->
			<section class="card grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				in:fly={{ y: 20, duration: 400, delay: 0 }}>
				<div class="col-span-full">
					<span class="font-bold">Personal Details</span>
				</div>

				<div class="col-span-2">
					<Input.Text name="firstname" label="First Name" errors={$errors.firstname}
						bind:value={$form.firstname} constraints={$constraints.firstname} required={$constraints.firstname?.required}>
						<Message message={$errors.firstname} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="middlename" label="Middle Name" errors={$errors.middlename}
						bind:value={$form.middlename} constraints={$constraints.middlename} required={false}>
						<Message message={$errors.middlename} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="lastname" label="Last Name" errors={$errors.lastname}
						bind:value={$form.lastname} constraints={$constraints.lastname} required={$constraints.lastname?.required}>
						<Message message={$errors.lastname} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Date name="birthdate" label="Date of Birth" errors={$errors.birthdate}
						bind:value={$form.birthdate} constraints={$constraints.birthdate} required={false}>
						<Message message={$errors.birthdate} />
					</Input.Date>
				</div>

				<div class="col-span-2">
					<fieldset class="fieldset w-full gap-0.5">
						<legend class="fieldset-legend p-0.5"><span>Sex</span></legend>
						<select name="sex" class="select select-sm w-full" bind:value={$form.sex}>
							<option value={0}>Not indicated</option>
							<option value={1}>Male</option>
							<option value={2}>Female</option>
						</select>
					</fieldset>
				</div>
			</section>

			<!-- Address -->
			<section class="card mt-2 grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				in:fly={{ y: 20, duration: 400, delay: 100 }}>
				<div class="col-span-full">
					<span class="font-bold">Address</span>
				</div>

				<div class="col-span-2">
					<Input.Text name="address_province" label="Province" errors={$errors.address_province}
						bind:value={$form.address_province} constraints={$constraints.address_province} required={$constraints.address_province?.required}>
						<Message message={$errors.address_province} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="address_city" label="City" errors={$errors.address_city}
						bind:value={$form.address_city} constraints={$constraints.address_city} required={$constraints.address_city?.required}>
						<Message message={$errors.address_city} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="address_barangay" label="Barangay" errors={$errors.address_barangay}
						bind:value={$form.address_barangay} constraints={$constraints.address_barangay} required={false}>
						<Message message={$errors.address_barangay} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="address_line" label="Address Line" errors={$errors.address_line}
						bind:value={$form.address_line} constraints={$constraints.address_line} required={false}>
						<Message message={$errors.address_line} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Number name="address_house_number" label="House Number" errors={$errors.address_house_number}
						bind:value={$form.address_house_number} constraints={$constraints.address_house_number} required={false}>
						<Message message={$errors.address_house_number} />
					</Input.Number>
				</div>
			</section>

			<!-- Contact -->
			<section class="card mt-2 grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				in:fly={{ y: 20, duration: 400, delay: 200 }}>
				<div class="col-span-full">
					<span class="font-bold">Contact Information</span>
				</div>

				<div class="col-span-2">
					<Input.Text name="contact_number" label="Contact Number" errors={$errors.contact_number}
						bind:value={$form.contact_number} constraints={$constraints.contact_number} required={false}>
						<Message message={$errors.contact_number} />
					</Input.Text>
				</div>

				<div class="col-span-2">
					<Input.Text name="email" label="Email Address" errors={$errors.email}
						bind:value={$form.email} constraints={$constraints.email} required={false}>
						<Message message={$errors.email} />
					</Input.Text>
				</div>
			</section>
		</div>

		<div class="flex w-full flex-row items-center justify-end gap-2">
			<a href={resolve(`/u/customers/${data.customer_id}`)} class="btn btn-ghost btn-md">Cancel</a>
			<button class="btn btn-md btn-primary" type="submit">Save Changes</button>
		</div>
	</form>
</div>
