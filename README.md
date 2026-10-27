# Island

A Dynamic Island-style surface for Svelte 5. One black pill morphs between a resting mark, a keyboard menu, a music player, a timed alert, and a counter with rolling digits.

The shell is a Svelte spring on width, height, and corner radius. Each state is a snippet you write, already laid out at its destination size. While the pill changes shape, that content only fades, blurs, and rises a few pixels, so type never stretches.

```bash
npm install
npm run dev
```

The demo serves at [http://127.0.0.1:4731](http://127.0.0.1:4731). `npm run build` produces the production build.

## Use it

```svelte
<script lang="ts">
	import { Island } from '$lib';
	import type { IslandStateId } from '$lib';

	let phase = $state<IslandStateId>('idle');
</script>

<Island
	state={phase}
	stiffness={0.17}
	damping={0.74}
	fade={200}
	notificationDuration={3400}
	oncollapse={() => (phase = 'idle')}
>
	{#snippet idle()}
		<button type="button" onclick={() => (phase = 'navigation')}>Open</button>
	{/snippet}

	{#snippet navigation()}
		<nav aria-label="Primary">
			<button type="button" onclick={() => (phase = 'idle')}>Close</button>
		</nav>
	{/snippet}

	{#snippet music()}
		<p>Now playing</p>
	{/snippet}

	{#snippet notification()}
		<p>Saved</p>
	{/snippet}

	{#snippet timer()}
		<p>00:00</p>
	{/snippet}
</Island>
```

In this repo the import is `#lib` (see `package.json` `"imports"`). In a stock SvelteKit app, point the same files at `$lib`.

`src/lib/island` is the piece you would package. The faces in `src/lib/demo` are the marketing page: idle mark, menu, player, alert, and timer. Replace them.

`RollingDigits` is exported on its own if you want the counter without the pill.

```svelte
<script lang="ts">
	import { RollingDigits } from '$lib';
	let ones = $state(0);
</script>

<RollingDigits value={ones} stiffness={0.17} damping={0.74} />
```

## Props

| Prop | Default | |
| --- | --- | --- |
| `state` | — | `'idle' \| 'navigation' \| 'music' \| 'notification' \| 'timer'`. Keep the variable you pass under another name — a local called `state` collides with the `$state` rune. |
| `stiffness` | `0.17` | Svelte spring stiffness, clamped to `0–1`. Higher is faster. |
| `damping` | `0.74` | Svelte spring damping, clamped to `0–1`. Lower overshoots. |
| `fade` | `200` | Content crossfade, in milliseconds. Exit is shorter; enter waits a beat. |
| `notificationDuration` | `3400` | Milliseconds before `oncollapse` when `state` is `'notification'`. |
| `sizes` | built in | Partial override of `{ width, height, radius }` per state. |
| `oncollapse` | — | Escape, a press outside, or the end of an alert. |
| `idle`, `navigation`, `music`, `notification`, `timer` | — | Snippets. A missing snippet renders nothing for that state. |

Target sizes shrink to the viewport (`viewport - 36`, never under 220). Idle stays `118 × 40`.

Pass `sizes` when your own snippet needs a different box. The snippet is centered in a layer of that exact size, clipped by the shell, so keep the layout inside the box you declare.

```svelte
<Island
	{state}
	sizes={{ music: { width: 400, height: 120, radius: 32 } }}
	oncollapse={() => (state = 'idle')}
/>
```

## Motion

- One `Spring` from `svelte/motion` drives width, height, and radius together, so they stay in proportion and can be interrupted.
- The spring writes the shell’s box from an effect. Snippets are not re-rendered on every frame.
- Content layers are positioned at the **target** size. Opacity, a 4px blur, and an 8px rise run on a separate duration (`fade`).
- Stiffness and damping are read every frame. Move the sliders during a transition and the current gesture follows.
- `RollingDigits` uses the same spring. `9 → 0` rolls forward. A little blur tracks how far the digit is from its target.
- `prefers-reduced-motion: reduce` snaps the spring, removes the blur and the rise, and hides the alert’s countdown hairline. The alert still closes on its timer.

## Keyboard

| Key | |
| --- | --- |
| `1`–`5` | Idle, menu, player, alert, timer |
| `Esc` | Close |
| `←` `→` `↑` `↓` `Home` `End` | Move inside the menu |
| `Space` / `Enter` | Activate the focused control |
| `←` `→` on the playback slider | Seek by 5 seconds |

Outside presses close the island. Anything marked `data-island-keep` (the demo’s controls) does not.

## Packaging

`src/lib/island` has no dependency on the demo page. To sell or ship it:

1. Copy `src/lib/island` into a Svelte library package (`@sveltejs/package`).
2. Export `Island`, `RollingDigits`, and the types from the package entry.
3. Add the license you want to sell under. This repo does not set one.

Peer dependency: `svelte` 5.8 or newer (`Spring`, snippets).

## Known limits

- Svelte’s spring is not a Newton model. Stiffness and damping live on a `0–1` scale and are clamped. The sliders show those real units.
- The shell animates `width` and `height` on one fixed element. That is what keeps the content from stretching. It is one layout write per frame, which is comfortable here and is not a transform-only animation.
- Very low damping with high stiffness overshoots. The shell can briefly grow past the content; you will see empty black padding. That is the spring, not a layout bug.
- Changing the hold slider while an alert is open restarts that alert’s timer.
- The idle CSS size in `Island.svelte` must stay in sync with `IDLE_BOX` in `types.ts`. The spring takes over after mount.
- Outfit and Instrument Serif load from Google Fonts. Offline, the page falls back to Georgia and system sans.
