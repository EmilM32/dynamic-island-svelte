<script lang="ts">
	import { untrack } from 'svelte';
	import { Spring, prefersReducedMotion } from 'svelte/motion';
	import type { Snippet } from 'svelte';
	import {
		DEFAULT_DAMPING,
		DEFAULT_FADE,
		DEFAULT_NOTIFICATION_MS,
		DEFAULT_STIFFNESS,
		IDLE_BOX,
		islandSizes,
		sameBox,
		type IslandBox,
		type IslandStateId
	} from './types.js';

	export type IslandProps = {
		/** Which box the shell is morphing toward. */
		state: IslandStateId;
		/** Svelte spring stiffness, 0–1. Higher is snappier. Read live, including mid-gesture. */
		stiffness?: number;
		/** Svelte spring damping, 0–1. Higher settles with less overshoot. */
		damping?: number;
		/** Content crossfade, in milliseconds. The shell ignores this and uses the spring. */
		fade?: number;
		/** How long a notification stays open before `oncollapse`. Paused while hovered, focused, or in a hidden tab. */
		notificationDuration?: number;
		/** Replace any of the built-in target boxes. */
		sizes?: Partial<Record<IslandStateId, Partial<IslandBox>>>;
		/** Accessible name of the island region. */
		label?: string;
		/** Escape, outside press, or the notification timer. */
		oncollapse?: () => void;
		idle?: Snippet;
		navigation?: Snippet;
		music?: Snippet;
		notification?: Snippet;
		timer?: Snippet;
	};

	let {
		state: phase,
		stiffness = DEFAULT_STIFFNESS,
		damping = DEFAULT_DAMPING,
		fade = DEFAULT_FADE,
		notificationDuration = DEFAULT_NOTIFICATION_MS,
		sizes,
		label = 'Island',
		oncollapse,
		idle,
		navigation,
		music,
		notification,
		timer
	}: IslandProps = $props();

	// Constant until after hydration so the server and the first client paint match.
	let viewport = $state(1280);

	const resolved = $derived(islandSizes(viewport, sizes));
	const fadeMs = $derived(Math.max(0, fade));
	const exitMs = $derived(Math.round(fadeMs * 0.68));
	const enterDelayMs = $derived(Math.round(fadeMs * 0.4));

	const box = new Spring(IDLE_BOX, {
		stiffness: untrack(() => stiffness),
		damping: untrack(() => damping),
		precision: 0.2
	});

	let shell: HTMLDivElement | undefined = $state();

	// Where focus goes back to when the layer holding it is hidden.
	let returnTo: HTMLElement | null = null;
	let focusLost = false;

	let hovering = $state(false);
	let focusWithin = $state(false);
	let tabHidden = $state(false);
	const paused = $derived(hovering || focusWithin || tabHidden);
	let holdLeft = 0;
	let holdFor: number | null = null;

	const layers = $derived([
		{ id: 'idle' as const, body: idle },
		{ id: 'navigation' as const, body: navigation },
		{ id: 'music' as const, body: music },
		{ id: 'notification' as const, body: notification },
		{ id: 'timer' as const, body: timer }
	]);

	$effect(() => {
		box.stiffness = stiffness;
		box.damping = damping;
	});

	$effect(() => {
		viewport = window.innerWidth;
	});

	$effect(() => {
		const next = resolved[phase];
		const instant = prefersReducedMotion.current;
		if (instant) {
			if (sameBox(box.target, next) && sameBox(box.current, next)) return;
			box.set(next, { instant: true });
			return;
		}
		if (sameBox(box.target, next)) return;
		box.set(next);
	});

	// Width, height, and radius are written here so a spring frame does not
	// re-render the snippets. Content stays at its target size and only fades.
	$effect(() => {
		const current = box.current;
		const node = shell;
		if (!node) return;
		node.style.width = `${current.width.toFixed(2)}px`;
		node.style.height = `${current.height.toFixed(2)}px`;
		node.style.borderRadius = `${current.radius.toFixed(2)}px`;
	});

	// Runs before the DOM update, while the outgoing layer is not inert yet.
	$effect.pre(() => {
		const next = phase;
		const active = document.activeElement;
		if (!shell || !(active instanceof Element) || !shell.contains(active)) return;
		focusLost = active.closest('[data-island-layer]')?.getAttribute('data-island-layer') !== next;
	});

	// `inert` drops focus to <body>. Give it back to where it came from, unless
	// the consumer already moved it somewhere else.
	$effect(() => {
		void phase;
		if (!focusLost) return;
		focusLost = false;
		const frame = requestAnimationFrame(() => {
			const active = document.activeElement;
			const stranded = !active || active === document.body || !!active.closest('[data-island-root] [inert]');
			if (stranded && returnTo?.isConnected) returnTo.focus({ preventScroll: true });
		});
		return () => cancelAnimationFrame(frame);
	});

	$effect(() => {
		if (phase !== 'notification' || notificationDuration <= 0) {
			holdFor = null;
			return;
		}
		if (holdFor !== notificationDuration) {
			holdFor = notificationDuration;
			holdLeft = notificationDuration;
		}
		if (paused) return;
		const started = performance.now();
		const id = setTimeout(() => oncollapse?.(), holdLeft);
		return () => {
			clearTimeout(id);
			holdLeft -= performance.now() - started;
		};
	});

	function onFocusIn(event: FocusEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement) || !shell) return;
		if (shell.contains(target)) {
			focusWithin = true;
		} else {
			returnTo = target;
		}
	}

	function onFocusOut(event: FocusEvent) {
		if (!shell || !shell.contains(event.target as Node)) return;
		const next = event.relatedTarget;
		focusWithin = next instanceof Node && shell.contains(next);
	}

	function onKey(event: KeyboardEvent) {
		if (event.defaultPrevented || event.key !== 'Escape' || phase === 'idle') return;
		event.preventDefault();
		oncollapse?.();
	}

	function onPointerDown(event: PointerEvent) {
		if (event.defaultPrevented || phase === 'idle') return;
		const target = event.target;
		if (!(target instanceof Element)) return;
		if (target.closest('[data-island-root], [data-island-keep]')) return;
		oncollapse?.();
	}
</script>

<svelte:window onkeydown={onKey} onresize={() => (viewport = window.innerWidth)} />
<svelte:document
	onpointerdown={onPointerDown}
	onfocusin={onFocusIn}
	onfocusout={onFocusOut}
	onvisibilitychange={() => (tabHidden = document.visibilityState === 'hidden')}
/>

<div class="anchor">
	<div
		bind:this={shell}
		class="shell"
		data-island-root
		data-state={phase}
		data-paused={phase === 'notification' && paused ? '' : undefined}
		style:--fade="{fadeMs}ms"
		style:--exit="{exitMs}ms"
		style:--enter-delay="{enterDelayMs}ms"
		role="region"
		aria-label={label}
		onpointerenter={(event) => (hovering = event.pointerType === 'mouse')}
		onpointerleave={() => (hovering = false)}
	>
		{#each layers as layer (layer.id)}
			{#if layer.body}
				<!-- Target size, not the spring, so type does not reflow while the shell morphs. -->
				<div
					class={['layer', { on: phase === layer.id }]}
					data-island-layer={layer.id}
					style:width="{resolved[layer.id].width}px"
					style:height="{resolved[layer.id].height}px"
					inert={phase === layer.id ? undefined : true}
					aria-hidden={phase === layer.id ? undefined : true}
				>
					{@render layer.body()}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.anchor {
		position: fixed;
		z-index: var(--island-z, 30);
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		padding-top: max(var(--island-top, 14px), env(safe-area-inset-top));
		pointer-events: none;
	}

	.shell {
		position: relative;
		pointer-events: auto;
		overflow: hidden;
		/* Keep in sync with IDLE_BOX in types.ts — the spring effect takes over after mount. */
		width: 118px;
		height: 40px;
		border-radius: 20px;
		background: var(--island-bg, #090909);
		color: var(--island-fg, #f6f3ee);
		box-shadow: var(
			--island-shadow,
			inset 0 1px 0 rgba(255, 255, 255, 0.16),
			inset 0 0 0 1px rgba(255, 255, 255, 0.06),
			0 18px 50px rgba(0, 0, 0, 0.28),
			0 2px 8px rgba(0, 0, 0, 0.2)
		);
		user-select: none;
		-webkit-font-smoothing: antialiased;
	}

	.layer {
		position: absolute;
		left: 50%;
		top: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		translate: -50% calc(-50% + 8px);
		opacity: 0;
		filter: blur(4px);
		pointer-events: none;
		transition:
			opacity var(--exit) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)),
			filter var(--exit) var(--ease, cubic-bezier(0.22, 1, 0.36, 1)),
			translate var(--exit) var(--ease, cubic-bezier(0.22, 1, 0.36, 1));
	}

	.layer.on {
		translate: -50% -50%;
		opacity: 1;
		filter: blur(0);
		pointer-events: auto;
		transition-duration: var(--fade);
		transition-delay: var(--enter-delay);
	}

	@media (prefers-reduced-motion: reduce) {
		.layer,
		.layer.on {
			transition: none;
			filter: none;
			translate: -50% -50%;
		}
	}
</style>
