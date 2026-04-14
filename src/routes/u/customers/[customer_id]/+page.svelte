<script>
	import {
		Building2,
		Cake,
		CalendarClock,
		Image,
		Mail,
		MapPin,
		MapPinned,
		Mars,
		PawPrint,
		Phone,
		Pin,
		ShoppingBag
	} from '@lucide/svelte';
</script>

<!-- <header class=" flex h-fit max-h-10 min-h-8 flex-row justify-between gap-8 overflow-hidden">
	<div>
		<p class="text-sm leading-4 font-semibold">Hello, Marlon</p>
		<p class="text-xs font-semibold text-zinc-500"></p>
	</div>

	<div>
		<button class="btn flex flex-row items-center pr-3.5 text-xs btn-sm btn-primary">
			<CirclePlus class="size-3.5" /> Add
		</button>
	</div>
</header> -->

<main class="flex h-full w-full flex-row gap-4">
	<section class="card flex h-full w-72 min-w-60 flex-col gap-4 bg-base-100 p-6">
		<div
			class="avatar max-w-40 rounded bg-secondary/70 text-2xl font-semibold text-secondary-content"
		>
			<div class="flex w-full items-center justify-center">
				<Image class="size-12 text-neutral-content" />
			</div>
		</div>

		<span class="text-lg font-bold">Juan Dela Cruz</span>

		<div class="relative min-h-0 w-full grow overflow-y-auto">
			<table class="w-full max-w-full border-separate border-spacing-y-4">
				<!-- customer contact table -->
				<thead>
					<tr>
						<th colspan="2" class="text-left text-sm">Contact</th>
					</tr>
				</thead>
				<tbody>
					<tr class="text-sm">
						<td><Phone class="mr-2 size-4" /></td>
						<td class="leading-4">{`(+63)9123456789`}</td>
					</tr>

					<tr class="text-sm">
						<td><Mail class="mr-2 size-4" /></td>
						<td class="leading-4">delacruz_95@gmail.com</td>
					</tr>
				</tbody>

				<!-- customer address table -->
				<thead>
					<tr>
						<th colspan="2" class="text-left text-sm">Address</th>
					</tr>
				</thead>
				<tbody>
					<tr class="text-sm">
						<td><MapPin class="mr-2 size-4" /></td>
						<td class="leading-4">P2 John Bosco District</td>
					</tr>

					<tr class="text-sm">
						<td><MapPinned class="mr-2 size-4" /></td>
						<td class="leading-4">Mangagoy</td>
					</tr>

					<tr class="text-sm">
						<td><Building2 class="mr-2 size-4" /></td>
						<td class="leading-4">City of Bislig, Surigao del Sur</td>
					</tr>
				</tbody>

				<!-- customer details table -->
				<thead>
					<tr>
						<th colspan="2" class="text-left text-sm">Customer details</th>
					</tr>
				</thead>
				<tbody>
					<tr class="text-sm">
						<td><Mars class="mr-2 size-4" /></td>
						<td class="leading-4">Male</td>
					</tr>

					<tr class="text-sm">
						<td><Cake class="mr-2 size-4" /></td>
						<td class="leading-4">February 31, 1995</td>
					</tr>
				</tbody>
			</table>

			<div
				class="pointer-events-none sticky bottom-0 flex h-40 min-h-40 w-full bg-base-100 mask-[linear-gradient(transparent,#000000)]"
			></div>
		</div>
	</section>

	<section class="tabs-lift tabs min-w-96 grow">
		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" checked />
			<CalendarClock class="me-2 size-4" />
			Appointments
		</label>
		{@render Appointments_Snippet()}

		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" />
			<PawPrint class="me-2 size-4" />
			Pets
		</label>
		<div class=" tab-content border-transparent bg-base-100 p-4">Pets</div>

		<label
			class="tab border-transparent bg-transparent px-4 checked:bg-base-100 has-checked:bg-base-100"
		>
			<input type="radio" name="tab_customer" />
			<ShoppingBag class="me-2 size-4" />
			Purchases
		</label>
		<div class=" tab-content border-transparent bg-base-100 p-4">Purchases</div>
	</section>
</main>

{#snippet Appointments_Snippet()}
	<div class=" tab-content rounded-ss-none border-transparent bg-base-100 p-4">
		<ul class="list h-full">
			{#each Array(3) as _}
				{@render Appointsments_List()}
			{:else}
				<li class="h-full flex align-center w-full justify-center">
					<span class="my-auto h-fit">No appointments</span>
				</li>
			{/each}
		</ul>
	</div>
{/snippet}

{#snippet Appointsments_List()}
	<li class="list-row h-20 max-h-24 min-h-20">
		<div class="0 avatar rounded bg-secondary/40">
			<div class=" flex size-12 items-center justify-center">
				<Image class="size-5 text-neutral-content" />
			</div>
		</div>

		<div>
			<h1 class=" font-semibold">Max</h1>
			<div class=" flex items-center gap-4 text-xs">
				<span>German Shepherd</span>
				<span>Brown</span>
			</div>
		</div>

		<div class="text-xs">
			<div class="flex flex-row gap-2">
				<h1 class="font-semibold">March 15, 2024</h1>
				<span>10:00 AM</span>
			</div>
			<div class="">
				<span>Check-up</span>
				<span>10:00 AM</span>
			</div>
		</div>
	</li>
{/snippet}
