<script lang="ts">
	type Props = {
		playing: boolean;
		onplayingchange?: (playing: boolean) => void;
	};

	let { playing, onplayingchange }: Props = $props();

	const DURATION = 134;
	const START = 0.08;

	let fill: HTMLDivElement | undefined = $state();
	let labelSec = $state(Math.floor(START * DURATION));
	let latest = START;
	let epoch = $state(0);

	function paint(value: number) {
		fill?.style.setProperty('--p', String(value));
	}

	function publish(value: number) {
		const clamped = Math.min(1, Math.max(0, value));
		latest = clamped;
		paint(clamped);
		const sec = Math.floor(clamped * DURATION);
		if (sec !== labelSec) labelSec = sec;
		return clamped;
	}

	$effect(() => {
		fill?.style.setProperty('--p', String(latest));
	});

	$effect(() => {
		void epoch;
		if (!playing) return;

		const from = latest;
		const start = performance.now();
		let frame = 0;

		const loop = (now: number) => {
			const next = from + (now - start) / 1000 / DURATION;
			if (next >= 1) {
				publish(1);
				onplayingchange?.(false);
				return;
			}
			publish(next);
			frame = requestAnimationFrame(loop);
		};

		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	});

	function toggle() {
		if (latest >= 1) publish(0);
		onplayingchange?.(!playing);
	}

	function pointToProgress(event: PointerEvent) {
		const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (bounds.width <= 0) return 0;
		return (event.clientX - bounds.left) / bounds.width;
	}

	function seek(event: PointerEvent) {
		const target = event.currentTarget as HTMLElement;
		target.setPointerCapture(event.pointerId);
		publish(pointToProgress(event));
		epoch += 1;
	}

	function drag(event: PointerEvent) {
		if (!event.currentTarget || !(event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) {
			return;
		}
		publish(pointToProgress(event));
		epoch += 1;
	}

	function nudge(event: KeyboardEvent) {
		if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
		event.preventDefault();
		const delta = event.key === 'ArrowRight' ? 5 : -5;
		publish((latest * DURATION + delta) / DURATION);
		epoch += 1;
	}

	const label = $derived(format(labelSec));
	const total = format(DURATION);

	function format(totalSeconds: number) {
		const seconds = Math.max(0, Math.floor(totalSeconds));
		const minutes = Math.floor(seconds / 60);
		const rest = seconds % 60;
		return `${minutes}:${rest.toString().padStart(2, '0')}`;
	}
</script>

<div class="player">
	<div class="cover" aria-hidden="true"></div>
	<div class="meta">
		<p class="title">Glasshouse</p>
		<p class="by">Yara Lin · {label}</p>
	</div>
	<button
		type="button"
		class="play"
		aria-label={playing ? 'Pause Glasshouse' : 'Play Glasshouse'}
		aria-pressed={playing}
		onclick={toggle}
	>
		{#if playing}
			<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
				<path d="M2.4 1.4h2.3v9.2H2.4zm4.9 0h2.3v9.2H7.3z" fill="currentColor" />
			</svg>
		{:else}
			<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true">
				<path d="M3 1.5v9l7.2-4.5L3 1.5z" fill="currentColor" />
			</svg>
		{/if}
	</button>
	<div
		class="track"
		role="slider"
		tabindex="0"
		aria-label="Playback position"
		aria-valuemin="0"
		aria-valuemax={DURATION}
		aria-valuenow={labelSec}
		aria-valuetext="{label} of {total}"
		onpointerdown={seek}
		onpointermove={drag}
		onkeydown={nudge}
	>
		<div class="groove">
			<div class="fill" bind:this={fill}></div>
		</div>
	</div>
</div>

<style>
	.player {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		grid-template-rows: 1fr auto;
		align-items: center;
		gap: 2px 12px;
		width: 100%;
		height: 100%;
		padding: 14px 14px 12px;
		container-type: inline-size;
	}

	.cover {
		grid-row: 1 / span 2;
		width: 66px;
		height: 66px;
		border-radius: 18px;
		background:
			linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)) center / 1.5px 70% no-repeat,
			linear-gradient(rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.55)) center / 70% 1.5px no-repeat,
			linear-gradient(155deg, #f2c48a 0%, #d4654a 46%, #241820 100%);
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
	}

	.meta {
		grid-column: 2;
		min-width: 0;
	}

	.title {
		margin: 0;
		font-size: 14.5px;
		font-weight: 500;
		letter-spacing: -0.02em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.by {
		margin: 2px 0 0;
		color: rgba(246, 243, 238, 0.62);
		font-size: 12px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.play {
		grid-column: 3;
		grid-row: 1 / span 2;
		display: grid;
		width: 36px;
		height: 36px;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: #f6f3ee;
		color: #111;
		cursor: pointer;
	}

	.play:focus-visible {
		outline: 2px solid #f6f3ee;
		outline-offset: 3px;
	}

	.track {
		grid-column: 2 / span 2;
		display: flex;
		align-items: center;
		height: 16px;
		cursor: pointer;
		touch-action: none;
	}

	.track:focus-visible {
		outline: 2px solid rgba(246, 243, 238, 0.85);
		outline-offset: 2px;
		border-radius: 999px;
	}

	.groove {
		position: relative;
		width: 100%;
		height: 3px;
		overflow: hidden;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.16);
	}

	.fill {
		position: absolute;
		inset: 0 auto 0 0;
		width: 100%;
		background: #f6f3ee;
		transform: scaleX(var(--p, 0.08));
		transform-origin: left center;
	}

	@container (max-width: 320px) {
		.player {
			gap: 2px 10px;
			padding: 12px;
		}

		.cover {
			width: 54px;
			height: 54px;
			border-radius: 15px;
		}

		.title {
			font-size: 13.5px;
		}
	}
</style>
