<script lang="ts">
	import { untrack } from 'svelte';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import { DEFAULT_DAMPING, DEFAULT_STIFFNESS } from './types.js';

	export type RollingDigitsProps = {
		/** Integer digit 0–9. Values wrap, and 9 → 0 rolls forward. */
		value: number;
		stiffness?: number;
		damping?: number;
	};

	let { value, stiffness = DEFAULT_STIFFNESS, damping = DEFAULT_DAMPING }: RollingDigitsProps = $props();

	const initial = untrack(() => normalize(value));

	const offset = new Spring(initial, {
		stiffness: untrack(() => stiffness),
		damping: untrack(() => damping),
		precision: 0.002
	});

	let committed = initial;
	let destination = initial;
	let token = 0;

	function normalize(digit: number) {
		return ((Math.trunc(digit) % 10) + 10) % 10;
	}

	$effect(() => {
		offset.stiffness = stiffness;
		offset.damping = damping;
	});

	$effect(() => {
		const next = normalize(value);
		const instant = prefersReducedMotion.current;
		const prev = committed;

		if (instant) {
			committed = next;
			destination = next;
			token += 1;
			offset.set(next, { instant: true });
			return;
		}

		if (prev === next) return;

		let delta = next - prev;
		if (delta > 5) delta -= 10;
		if (delta < -5) delta += 10;

		committed = next;
		destination += delta;
		const dest = destination;
		const currentToken = ++token;

		void offset.set(dest).then(() => {
			if (currentToken !== token) return;
			const mod = normalize(Math.round(dest));
			if (Math.abs(dest - mod) > 0.0001) {
				destination = mod;
				offset.set(mod, { instant: true });
			}
		});
	});

	const rendered = $derived.by(() => {
		const current = offset.current;
		if (Math.abs(current - offset.target) < 0.004) return offset.target;
		return current;
	});

	const blur = $derived(Math.min(2.4, Math.abs(rendered - offset.target) * 3));

	const start = $derived(Math.floor(rendered) - 2);
	const digits = $derived(Array.from({ length: 7 }, (_, index) => start + index));
</script>

<span class="cell" aria-hidden="true">
	<span
		class="reel"
		style:translate="0 {(start - rendered).toFixed(4)}em"
		style:filter={blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : 'none'}
	>
		{#each digits as digit (digit)}
			<span class="num">{normalize(digit)}</span>
		{/each}
	</span>
</span>

<style>
	.cell {
		display: inline-block;
		position: relative;
		width: 0.66em;
		height: 1em;
		overflow: hidden;
		line-height: 1;
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum';
	}

	.reel {
		position: absolute;
		left: 0;
		top: 0;
		display: flex;
		flex-direction: column;
		width: 100%;
	}

	.num {
		display: grid;
		height: 1em;
		place-items: center;
	}
</style>
