<script lang="ts">
	import type { Attachment } from 'svelte/attachments';

	type Item = { id: string; label: string };

	type Props = {
		items: readonly Item[];
		current: string | null;
		active?: boolean;
		onselect?: (id: string) => void;
	};

	let { items, current, active = false, onselect }: Props = $props();

	let focusIndex = $state(0);
	let buttons: (HTMLButtonElement | undefined)[] = [];
	let wasActive = false;

	function remember(index: number): Attachment {
		return (node) => {
			buttons[index] = node as HTMLButtonElement;
			return () => {
				if (buttons[index] === node) buttons[index] = undefined;
			};
		};
	}

	$effect(() => {
		if (active && !wasActive) {
			const selected = items.findIndex((item) => item.id === current);
			const index = selected >= 0 ? selected : 0;
			focusIndex = index;
			requestAnimationFrame(() => buttons[index]?.focus({ preventScroll: true }));
		}
		wasActive = active;
	});

	function move(event: KeyboardEvent) {
		let next = focusIndex;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			next = (focusIndex + 1) % items.length;
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			next = (focusIndex - 1 + items.length) % items.length;
		} else if (event.key === 'Home') {
			next = 0;
		} else if (event.key === 'End') {
			next = items.length - 1;
		} else {
			return;
		}
		event.preventDefault();
		focusIndex = next;
		buttons[next]?.focus({ preventScroll: true });
	}
</script>

<nav class="nav" aria-label="Primary" style:--count={items.length}>
	{#each items as item, index (item.id)}
		<button
			{@attach remember(index)}
			type="button"
			class="item"
			aria-current={item.id === current ? 'page' : undefined}
			tabindex={index === focusIndex ? 0 : -1}
			onclick={() => onselect?.(item.id)}
			onkeydown={move}
			onfocus={() => (focusIndex = index)}
		>
			{item.label}
		</button>
	{/each}
</nav>

<style>
	.nav {
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
		align-items: center;
		width: 100%;
		height: 100%;
		padding: 6px;
		gap: 2px;
		container-type: inline-size;
	}

	.item {
		height: 100%;
		min-width: 0;
		padding: 0 8px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: rgba(246, 243, 238, 0.78);
		font: inherit;
		font-size: 14px;
		font-weight: 500;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		cursor: pointer;
		transition: background-color 160ms ease, color 160ms ease;
	}

	.item:hover {
		background: rgba(255, 255, 255, 0.08);
		color: #f6f3ee;
	}

	.item[aria-current='page'] {
		background: rgba(255, 255, 255, 0.14);
		color: #f6f3ee;
	}

	.item:focus-visible {
		outline: 2px solid #f6f3ee;
		outline-offset: -2px;
	}

	@container (max-width: 420px) {
		.nav {
			padding-inline: 4px;
			gap: 0;
		}

		.item {
			padding-inline: 2px;
			font-size: 13px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.item {
			transition: none;
		}
	}
</style>
