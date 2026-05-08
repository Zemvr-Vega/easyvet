<script lang="ts">
	import Input from '$lib/components/ui/form/input/Input';
	import Message from '$lib/components/ui/form/message/Message.svelte';
	import { superForm } from 'sveltekit-superforms/client';

	const { data } = $props();
	const { form, errors, constraints, enhance } = superForm(data.form, { delayMs: 500 });
</script>

<div class="h-full w-full">
	<form
		class="flex h-full w-full flex-col gap-4 p-4 pb-8"
		action="?/new"
		method="POST"
		use:enhance
		novalidate
	>
		<div class="flex flex-col items-center overflow-y-auto">
			<div class="flex w-full max-w-2xl grow flex-col gap-6">
				<!-- Personal Information Section -->
				<section
					class="ev-fade-up card grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
				>
					<div class="col-span-full flex flex-col">
						<span class="font-bold">Personal Details</span>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="firstname"
							label="First Name"
							errors={$errors.firstname}
							bind:value={$form.firstname}
							constraints={$constraints.firstname}
							required={$constraints.firstname?.required}
						>
							<Message message={$errors.firstname} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="middlename"
							label="Middle Name"
							errors={$errors.middlename}
							bind:value={$form.middlename}
							constraints={$constraints.middlename}
							required={$constraints.middlename?.required}
						>
							<Message message={$errors.middlename} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="lastname"
							label="Last Name"
							errors={$errors.lastname}
							bind:value={$form.lastname}
							constraints={$constraints.lastname}
							required={$constraints.lastname?.required}
						>
							<Message message={$errors.lastname} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Date
							name="birthdate"
							label="Date of Birth"
							errors={$errors.birthdate}
							bind:value={$form.birthdate}
							constraints={$constraints.birthdate}
							required={$constraints.birthdate?.required}
						>
							<Message message={$errors.birthdate} />
						</Input.Date>
					</div>
				</section>

				<!-- Address Information Section -->
				<section
					class="ev-fade-up card grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
					style="animation-delay: 100ms;"
				>
					<div class="col-span-full flex flex-col">
						<span class="font-bold">Address</span>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="address_province"
							label="Province"
							errors={$errors.address_province}
							bind:value={$form.address_province}
							constraints={$constraints.address_province}
							required={$constraints.address_province?.required}
						>
							<Message message={$errors.address_province} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="address_city"
							label="City"
							errors={$errors.address_city}
							bind:value={$form.address_city}
							constraints={$constraints.address_city}
							required={$constraints.address_city?.required}
						>
							<Message message={$errors.address_city} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="address_barangay"
							label="Barangay"
							errors={$errors.address_barangay}
							bind:value={$form.address_barangay}
							constraints={$constraints.address_barangay}
							required={$constraints.address_barangay?.required}
						>
							<Message message={$errors.address_barangay} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="address_line"
							label="Address Line"
							errors={$errors.address_line}
							bind:value={$form.address_line}
							constraints={$constraints.address_line}
							required={$constraints.address_line?.required}
						>
							<Message message={$errors.address_line} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="address_house_number"
							label="House Number"
							errors={$errors.address_house_number}
							bind:value={$form.address_house_number}
							constraints={$constraints.address_house_number}
							required={$constraints.address_house_number?.required}
						>
							<Message message={$errors.address_house_number} />
						</Input.Text>
					</div>
				</section>

				<!-- Contact Information Section -->
				<section
					class="ev-fade-up card grid w-full grid-cols-4 gap-x-2 gap-y-4 bg-base-100 p-4 shadow-sm"
					style="animation-delay: 200ms;"
				>
					<div class="col-span-full flex flex-col">
						<span class="font-bold">Contact Information</span>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="contact_number"
							label="Contact Number"
							errors={$errors.contact_number}
							bind:value={$form.contact_number}
							constraints={$constraints.contact_number}
							required={$constraints.contact_number?.required}
						>
							<Message message={$errors.contact_number} />
						</Input.Text>
					</div>

					<div class="col-span-2">
						<Input.Text
							name="email"
							label="Email Address"
							errors={$errors.email}
							bind:value={$form.email}
							constraints={$constraints.email}
							required={$constraints.email?.required}
						>
							<Message message={$errors.email} />
						</Input.Text>
					</div>
				</section>

				<section class="flex w-full flex-row items-center justify-start">
					<button class="btn btn-wide btn-md btn-primary">Submit</button>
				</section>
			</div>
		</div>
	</form>
</div>
