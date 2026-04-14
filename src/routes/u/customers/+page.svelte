<script lang="ts">
	import Pagination from '$lib/components/features/pagination/Pagination.svelte';
	import { Archive, CirclePlus, Pencil, SquareArrowOutUpRight } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { slide } from 'svelte/transition';

	let table_selected_row: number = $state<number>(0);

	const selectRow = (i: number) => {
		if (table_selected_row == i) {
			table_selected_row = 0;
		} else {
			table_selected_row = i;
		}
	};
</script>

<header class=" flex h-fit max-h-10 min-h-8 flex-row justify-between gap-8 overflow-hidden">
	<button
		class="input input-sm w-full max-w-48 cursor-pointer input-ghost bg-base-200 ring-0 ring-transparent hover:bg-base-300 focus:outline-none"
	>
		<span class="grow text-left">Search...</span>
		<div>
			<kbd class="kbd kbd-xs">Ctrl+K</kbd>
		</div>
	</button>

	<div>
		<a
			class="btn flex flex-row items-center pr-3.5 text-xs btn-sm btn-primary"
			href={resolve('/u/customers/new')}
		>
			<CirclePlus class="size-3.5" /> Add
		</a>
	</div>
</header>

<main class="min-h-0 grow rounded-xl bg-base-100 p-4">
	<div class="h-full min-h-full overflow-y-auto">
		<table class="table-pin-rows table">
			<thead class="z-20 text-xs">
				<tr class="z-20">
					<th class="w-0 p-0"></th>
					<th>Name</th>
					<th>Contact number</th>
					<th>Address</th>
					<th>Total Pets</th>
				</tr>
			</thead>

			<tbody class="z-10 text-xs">
				{#each Array.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]) as i, index (index)}
					<tr
						class={[
							'relative z-10 cursor-pointer hover:bg-base-300',
							table_selected_row === i && 'bg-base-300'
						]}
						onclick={() => selectRow(i)}
					>
						{#key table_selected_row}
							<td
								class={[
									'absolute z-10 flex h-full w-0 flex-row items-center bg-neutral/70 p-0 backdrop-blur-[2px]',
									table_selected_row === i && 'w-full overflow-hidden px-4'
								]}
								in:slide={{ duration: 500, axis: 'x' }}
								out:slide={{ delay: 200, axis: 'x' }}
							>
								<div
									class={[
										'flex w-fit min-w-0 grow flex-row gap-1 overflow-hidden',
										table_selected_row == i ? 'block' : 'hidden'
									]}
									in:slide={{ axis: 'x' }}
									out:slide={{ axis: 'x' }}
								>
									<a
										href={resolve('/u/customers/1')}
										class="btn items-center pr-2.5 btn-soft btn-xs btn-primary"
										onclick={(e) => {
											e.stopImmediatePropagation();
										}}
									>
										<SquareArrowOutUpRight class="size-3" />View
									</a>
									<a
										href={resolve('/')}
										class="btn items-center pr-2.5 btn-soft btn-xs btn-accent"
										onclick={(e) => {
											e.stopImmediatePropagation();
										}}
									>
										<Pencil class="size-3" />Edit
									</a>
									<button
										class="btn items-center pr-2.5 btn-soft btn-xs btn-error"
										type="button"
										onclick={(e) => {
											e.stopImmediatePropagation();
										}}
									>
										<Archive class="size-3" />Archive
									</button>
								</div>
							</td>
						{/key}
						<td>Juan Dela Cruz</td>
						<td>09123456789</td>
						<td>P5 Castillo Village, Mangagoy, Bislig City</td>
						<td>6</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</main>

<footer>
	<Pagination total={0} />
</footer>
