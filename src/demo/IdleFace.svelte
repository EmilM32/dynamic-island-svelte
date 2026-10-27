<script lang="ts">
	type Props = {
		lively?: boolean;
		onopen?: (button: HTMLButtonElement) => void;
	};

	let { lively = false, onopen }: Props = $props();
</script>

<button
	type="button"
	class={['idle', { lively }]}
	aria-label="Open menu"
	onclick={(event) => {
		const button = event.currentTarget;
		if (button instanceof HTMLButtonElement) onopen?.(button);
	}}
>
	<span class="bars" aria-hidden="true">
		<i></i>
		<i></i>
		<i></i>
	</span>
</button>

<style>
	.idle {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: inherit;
		background: transparent;
		color: white;
		cursor: pointer;
	}

	.idle:focus-visible {
		outline: 2px solid rgba(255, 255, 255, 0.9);
		outline-offset: -6px;
	}

	.bars {
		display: flex;
		align-items: center;
		gap: 3px;
		height: 12px;
	}

	.bars i {
		display: block;
		width: 2px;
		border-radius: 999px;
		background: #f6f3ee;
		transform-origin: center;
	}

	.bars i:nth-child(1) {
		height: 6px;
	}

	.bars i:nth-child(2) {
		height: 11px;
	}

	.bars i:nth-child(3) {
		height: 7px;
	}

	.lively .bars i {
		animation: breathe 1.05s ease-in-out infinite;
	}

	.lively .bars i:nth-child(2) {
		animation-delay: 0.12s;
	}

	.lively .bars i:nth-child(3) {
		animation-delay: 0.24s;
	}

	@keyframes breathe {
		0%,
		100% {
			transform: scaleY(0.45);
		}
		50% {
			transform: scaleY(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.lively .bars i {
			animation: none;
		}
	}
</style>
