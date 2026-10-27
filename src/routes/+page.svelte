<script lang="ts">
	import {
		DEFAULT_DAMPING,
		DEFAULT_FADE,
		DEFAULT_NOTIFICATION_MS,
		DEFAULT_STIFFNESS,
		Island,
		type IslandStateId
	} from '#lib';
	import { chapters, type ChapterId } from '#lib/demo/chapters.ts';
	import IdleFace from '#lib/demo/IdleFace.svelte';
	import MusicPlayer from '#lib/demo/MusicPlayer.svelte';
	import NavMenu from '#lib/demo/NavMenu.svelte';
	import Notice from '#lib/demo/Notice.svelte';
	import Slider from '#lib/demo/Slider.svelte';
	import TimerFace from '#lib/demo/TimerFace.svelte';

	const states: { id: IslandStateId; label: string; key: string }[] = [
		{ id: 'idle', label: 'Idle', key: '1' },
		{ id: 'navigation', label: 'Menu', key: '2' },
		{ id: 'music', label: 'Player', key: '3' },
		{ id: 'notification', label: 'Alert', key: '4' },
		{ id: 'timer', label: 'Timer', key: '5' }
	];

	let phase = $state<IslandStateId>('idle');
	let stiffness = $state(DEFAULT_STIFFNESS);
	let damping = $state(DEFAULT_DAMPING);
	let fade = $state(DEFAULT_FADE);
	let hold = $state(DEFAULT_NOTIFICATION_MS);
	let playing = $state(false);
	let chapter = $state<ChapterId | null>(null);
	let returnTo = $state<HTMLButtonElement | null>(null);

	const chapterCopy = $derived(chapters.find((item) => item.id === chapter) ?? null);
	const alertText = $derived(phase === 'notification' ? 'Saved. Study 04 is on the board.' : '');

	function remember(button: HTMLButtonElement | null) {
		if (button) returnTo = button;
	}

	function setIsland(next: IslandStateId, button?: HTMLButtonElement | null) {
		remember(button ?? null);
		phase = phase === next ? 'idle' : next;
	}

	function collapse() {
		const inside = document.activeElement?.closest('[data-island-root]');
		phase = 'idle';
		if (inside) queueMicrotask(() => returnTo?.focus({ preventScroll: true }));
	}

	function openMenu(button: HTMLButtonElement) {
		remember(button);
		phase = 'navigation';
	}

	function selectChapter(id: string) {
		chapter = id as ChapterId;
		collapse();
	}

	function onKey(event: KeyboardEvent) {
		if (event.metaKey || event.ctrlKey || event.altKey) return;
		if (event.target instanceof HTMLInputElement) return;
		const next = states.find((item) => item.key === event.key);
		if (!next) return;
		event.preventDefault();
		const button = document.getElementById(`state-${next.id}`);
		setIsland(next.id, button instanceof HTMLButtonElement ? button : null);
	}

	function toggleTheme() {
		const root = document.documentElement;
		const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
		root.dataset.theme = next;
		localStorage.setItem('island-theme', next);
	}
</script>

<svelte:window onkeydown={onKey} />

<Island
	state={phase}
	{stiffness}
	{damping}
	{fade}
	notificationDuration={hold}
	oncollapse={collapse}
>
	{#snippet idle()}
		<IdleFace lively={playing} onopen={openMenu} />
	{/snippet}
	{#snippet navigation()}
		<NavMenu
			items={chapters}
			current={chapter}
			active={phase === 'navigation'}
			onselect={selectChapter}
		/>
	{/snippet}
	{#snippet music()}
		<MusicPlayer {playing} onplayingchange={(value) => (playing = value)} />
	{/snippet}
	{#snippet notification()}
		<Notice active={phase === 'notification'} duration={hold} />
	{/snippet}
	{#snippet timer()}
		<TimerFace active={phase === 'timer'} {stiffness} {damping} />
	{/snippet}
</Island>

<div class="sr" aria-live="polite">{alertText}</div>

<main class="layout">
	<div class="copy">
		<p class="eyebrow">Component 01</p>
		<h1>The <em>island</em></h1>
		<p class="lede">
			A black pill that changes jobs. Menu, player, alert, timer — one surface, one spring. The
			words fade on their own, so the type never stretches with the shell.
		</p>

		{#key chapter ?? 'intro'}
			<article class="chapter">
				{#if chapterCopy}
					<p class="kicker">{chapterCopy.label}</p>
					<p>{chapterCopy.body}</p>
				{:else}
					<p class="kicker">Open the menu</p>
					<p>Five states, every direction. The sliders stay live while it moves.</p>
				{/if}
			</article>
		{/key}

		<p class="hints">Keys 1–5 switch states. Escape closes. Arrows move through the menu.</p>
		<p class="path">src/lib/island</p>
	</div>

	<div class="stage" data-island-keep>
		<div class="stage-top">
			<h2>Stage</h2>
			<button type="button" class="theme" aria-label="Switch color theme" onclick={toggleTheme}>
				<svg class="when-light" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
					<path
						d="M14.5 3.2a7.8 7.8 0 1 0 6.3 10.2A7 7 0 0 1 14.5 3.2z"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linejoin="round"
					/>
				</svg>
				<svg class="when-dark" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
					<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6" />
					<path
						d="M12 3.2v1.8M12 19v1.8M3.2 12H5M19 12h1.8M5.4 5.4l1.3 1.3M17.3 17.3l1.3 1.3M18.6 5.4l-1.3 1.3M6.7 17.3l-1.3 1.3"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						stroke-linecap="round"
					/>
				</svg>
			</button>
		</div>

		<div class="switcher" role="group" aria-label="Island state">
			{#each states as item (item.id)}
				<button
					id="state-{item.id}"
					type="button"
					aria-pressed={phase === item.id}
					aria-keyshortcuts={item.key}
					onclick={(event) => setIsland(item.id, event.currentTarget)}
				>
					{item.label}
					<kbd>{item.key}</kbd>
				</button>
			{/each}
		</div>

		<section class="motion" aria-labelledby="motion-heading">
			<h2 id="motion-heading">Motion</h2>
			<Slider
				label="Stiffness"
				value={stiffness}
				min={0.05}
				max={0.35}
				step={0.01}
				display={stiffness.toFixed(2)}
				oninput={(value) => (stiffness = value)}
			/>
			<Slider
				label="Damping"
				value={damping}
				min={0.45}
				max={1}
				step={0.01}
				display={damping.toFixed(2)}
				oninput={(value) => (damping = value)}
			/>
			<Slider
				label="Fade"
				value={fade}
				min={80}
				max={420}
				step={10}
				display="{Math.round(fade)} ms"
				oninput={(value) => (fade = value)}
			/>
			<Slider
				label="Hold"
				value={hold}
				min={1400}
				max={6000}
				step={100}
				display="{(hold / 1000).toFixed(1)} s"
				oninput={(value) => (hold = value)}
			/>
			<p class="note">
				Stiffness and damping are Svelte’s spring, on a 0–1 scale, applied while a gesture is
				still moving. Fade is the content crossfade. Hold is how long the alert stays up. Reduced
				motion snaps the shell and drops the blur.
			</p>
		</section>
	</div>
</main>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
		gap: clamp(32px, 5vw, 80px);
		width: min(1080px, calc(100% - 40px));
		margin: 0 auto;
		padding: clamp(140px, 20vh, 188px) 0 88px;
		align-items: start;
	}

	.eyebrow,
	.kicker,
	.hints,
	.note,
	.stage-top h2,
	.motion h2 {
		margin: 0;
		color: var(--muted);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.16em;
		text-transform: uppercase;
	}

	h1 {
		margin: 14px 0 0;
		font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
		font-size: clamp(68px, 9vw, 108px);
		font-weight: 400;
		letter-spacing: -0.035em;
		line-height: 0.86;
		text-wrap: balance;
	}

	h1 em {
		font-style: italic;
	}

	.lede {
		max-width: 38ch;
		margin: 22px 0 0;
		color: var(--muted);
		font-size: 18px;
		font-weight: 400;
		line-height: 1.45;
	}

	.chapter {
		max-width: 42ch;
		margin-top: 36px;
		animation: rise 520ms var(--ease);
	}

	.chapter p:last-child {
		margin: 10px 0 0;
		font-family: 'Instrument Serif', Georgia, 'Times New Roman', serif;
		font-size: clamp(24px, 2.5vw, 32px);
		line-height: 1.2;
		letter-spacing: -0.02em;
		color: var(--ink);
		text-wrap: pretty;
	}

	.hints {
		margin-top: 28px;
		letter-spacing: 0.04em;
		text-transform: none;
		font-size: 13px;
	}

	.path {
		margin: 10px 0 0;
		color: var(--muted);
		font-family: ui-monospace, 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 12px;
	}

	.stage {
		display: grid;
		gap: 22px;
		padding-top: 12px;
	}

	.stage-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.theme {
		display: grid;
		width: 36px;
		height: 36px;
		place-items: center;
		padding: 0;
		border: 1px solid var(--line);
		border-radius: 50%;
		background: transparent;
		cursor: pointer;
	}

	.theme:hover {
		background: var(--hover);
	}

	.theme:focus-visible,
	.switcher button:focus-visible {
		outline: 2px solid var(--ink);
		outline-offset: 3px;
	}

	.when-dark {
		display: none;
	}

	:global(:root[data-theme='dark']) .when-light {
		display: none;
	}

	:global(:root[data-theme='dark']) .when-dark {
		display: block;
	}

	.switcher {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		width: fit-content;
		max-width: 100%;
		padding: 4px;
		border-radius: 18px;
		background: var(--track);
	}

	.switcher button {
		display: inline-flex;
		align-items: center;
		min-height: 40px;
		padding: 0 14px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		cursor: pointer;
		font-size: 14px;
		font-weight: 500;
	}

	.switcher button:hover {
		background: var(--hover);
	}

	.switcher button[aria-pressed='true'] {
		background: var(--ink);
		color: var(--on-accent);
	}

	kbd {
		margin-left: 8px;
		color: currentColor;
		opacity: 0.45;
		font-family: inherit;
		font-size: 11px;
	}

	.motion {
		display: grid;
		gap: 8px;
		padding-top: 8px;
		border-top: 1px solid var(--line);
	}

	.motion h2 {
		margin-bottom: 4px;
	}

	.note {
		margin: 8px 0 0;
		letter-spacing: 0;
		text-transform: none;
		font-size: 13px;
		line-height: 1.45;
	}

	@keyframes rise {
		from {
			opacity: 0;
			translate: 0 8px;
		}
		to {
			opacity: 1;
			translate: 0 0;
		}
	}

	@media (max-width: 860px) {
		.layout {
			grid-template-columns: 1fr;
			width: min(680px, calc(100% - 32px));
			padding-top: 136px;
		}

		.stage {
			padding-top: 8px;
		}
	}

	@media (max-width: 560px) {
		h1 {
			font-size: 64px;
		}

		kbd {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.chapter {
			animation: none;
		}
	}
</style>
