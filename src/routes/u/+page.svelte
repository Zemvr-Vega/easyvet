<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	onMount(() => goto('/u/dashboard'));
</script>
<div class="flex h-dvh items-center justify-center">
	<span class="loading loading-spinner loading-lg text-primary"></span>
</div>
