<script lang="ts">
	type Props = {
		active: boolean;
		duration: number;
		title?: string;
		message?: string;
	};

	let {
		active,
		duration,
		title = 'Saved',
		message = 'Study 04 is on the board.'
	}: Props = $props();

	let phase = $state<'idle' | 'full' | 'run'>('idle');

	$effect(() => {
		if (!active) {
			phase = 'idle';
			return;
		}
		void duration;
		phase = 'full';
		const frame = requestAnimationFrame(() => {
			phase = 'run';
		});
		return () => cancelAnimationFrame(frame);
	});
</script>

<div class="notice">
	<span class="icon" aria-hidden="true">
		<svg viewBox="0 0 16 16" width="15" height="15">
			<path
				d="M3.2 8.4 6.3 11.4 12.8 4.6"
				fill="none"
				stroke="currentColor"
				stroke-width="1.7"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</span>
	<div class="copy">
		<p class="title">{title}</p>
		<p class="message">{message}</p>
	</div>
	<div class="meter" class:run={phase === 'run'} style:--hold="{duration}ms" aria-hidden="true"></div>
</div>

<style>
	.notice {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		height: 100%;
		padding: 0 18px 0 14px;
		overflow: hidden;
	}

	.icon {
		display: grid;
		flex: none;
		width: 28px;
		height: 28px;
		place-items: center;
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.12);
		color: #f6f3ee;
	}

	.copy {
		min-width: 0;
	}

	.title,
	.message {
		margin: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.title {
		font-size: 13.5px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}

	.message {
		margin-top: 1px;
		color: rgba(246, 243, 238, 0.62);
		font-size: 12px;
	}

	.meter {
		position: absolute;
		right: 14px;
		bottom: 8px;
		left: 14px;
		height: 2px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.78);
		transform: scaleX(1);
		transform-origin: left center;
	}

	.meter.run {
		animation: drain var(--hold) linear forwards;
	}

	/* The island pauses its timer on hover, focus, and hidden tabs. */
	:global([data-island-root][data-paused]) .meter {
		animation-play-state: paused;
	}

	@keyframes drain {
		to {
			transform: scaleX(0);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.meter {
			display: none;
		}
	}
</style>
