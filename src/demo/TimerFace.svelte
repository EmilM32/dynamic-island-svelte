<script lang="ts">
	import { DEFAULT_DAMPING, DEFAULT_STIFFNESS, RollingDigits } from '#lib';

	type Props = {
		active: boolean;
		stiffness?: number;
		damping?: number;
	};

	let { active, stiffness = DEFAULT_STIFFNESS, damping = DEFAULT_DAMPING }: Props = $props();

	let running = $state(false);
	let accumulated = $state(0);
	let startedAt = $state(0);
	let shownSec = $state(0);
	let primed = false;

	$effect(() => {
		if (!active || primed) return;
		primed = true;
		startedAt = performance.now();
		running = true;
	});

	$effect(() => {
		// Hidden layers skip the frame loop; the clock catches up when shown again.
		if (!running || !active) return;
		const origin = startedAt;
		const base = accumulated;
		let frame = 0;
		let last = -1;

		const tick = (now: number) => {
			const sec = Math.floor((base + (now - origin)) / 1000);
			if (sec !== last) {
				last = sec;
				shownSec = sec;
			}
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	});

	function toggle() {
		if (running) {
			accumulated += performance.now() - startedAt;
			shownSec = Math.floor(accumulated / 1000);
			running = false;
			return;
		}
		startedAt = performance.now();
		running = true;
	}

	function reset() {
		accumulated = 0;
		shownSec = 0;
		if (running) startedAt = performance.now();
	}

	const mm = $derived(Math.floor(shownSec / 60) % 100);
	const ss = $derived(shownSec % 60);
	const clock = $derived(
		`${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
	);
	const caption = $derived(running ? 'Running' : shownSec === 0 ? 'Ready' : 'Paused');
</script>

<div class="timer" role="group" aria-label="Session timer {clock}, {caption}">
	<div class="readout">
		<div class="digits" aria-hidden="true">
			<RollingDigits value={Math.floor(mm / 10)} {stiffness} {damping} />
			<RollingDigits value={mm % 10} {stiffness} {damping} />
			<span class="colon">:</span>
			<RollingDigits value={Math.floor(ss / 10)} {stiffness} {damping} />
			<RollingDigits value={ss % 10} {stiffness} {damping} />
		</div>
		<p class="caption">{caption}</p>
	</div>
	<div class="controls">
		<button
			type="button"
			class="pause"
			aria-label={running ? 'Pause timer' : 'Resume timer'}
			aria-pressed={running}
			onclick={toggle}
		>
			{#if running}
				<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
					<path d="M2.4 1.4h2.3v9.2H2.4zm4.9 0h2.3v9.2H7.3z" fill="currentColor" />
				</svg>
			{:else}
				<svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
					<path d="M3 1.5v9l7.2-4.5L3 1.5z" fill="currentColor" />
				</svg>
			{/if}
		</button>
		<button type="button" class="reset" onclick={reset}>Reset</button>
	</div>
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		padding: 0 16px 0 22px;
		gap: 10px;
	}

	.readout {
		min-width: 0;
	}

	.digits {
		display: flex;
		align-items: center;
		height: 1em;
		font-size: 34px;
		font-weight: 500;
		letter-spacing: -0.04em;
		line-height: 1;
		font-variant-numeric: tabular-nums;
	}

	.colon {
		width: 0.36em;
		text-align: center;
		color: rgba(246, 243, 238, 0.55);
		transform: translateY(-0.04em);
	}

	.caption {
		margin: 4px 0 0;
		color: rgba(246, 243, 238, 0.55);
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	.controls {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.pause {
		display: grid;
		width: 32px;
		height: 32px;
		place-items: center;
		padding: 0;
		border: 0;
		border-radius: 50%;
		background: #f6f3ee;
		color: #111;
		cursor: pointer;
	}

	.pause:focus-visible,
	.reset:focus-visible {
		outline: 2px solid #f6f3ee;
		outline-offset: 3px;
	}

	.reset {
		padding: 0;
		border: 0;
		background: transparent;
		color: rgba(246, 243, 238, 0.55);
		font: inherit;
		font-size: 10px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		cursor: pointer;
	}

	@media (hover: hover) and (pointer: fine) {
		.reset:hover {
			color: #f6f3ee;
		}
	}

	/* Hit areas. The pause area stops where the reset area starts. */
	.pause,
	.reset {
		position: relative;
	}

	.pause::after,
	.reset::after {
		content: '';
		position: absolute;
	}

	.pause::after {
		width: 44px;
		height: 40px;
		left: 50%;
		top: 50%;
		translate: -50% -50%;
	}

	.reset::after {
		inset: -4px -8px -10px;
	}
</style>
