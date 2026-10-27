export const ISLAND_STATES = ['idle', 'navigation', 'music', 'notification', 'timer'] as const;

export type IslandStateId = (typeof ISLAND_STATES)[number];

export type IslandBox = {
	width: number;
	height: number;
	radius: number;
};

/**
 * Svelte's `Spring` clamps both of these to 0–1.
 * 0.17 / 0.74 settles a size change in about 430ms with almost no overshoot.
 */
export const DEFAULT_STIFFNESS = 0.17;
export const DEFAULT_DAMPING = 0.74;
export const DEFAULT_FADE = 200;
export const DEFAULT_NOTIFICATION_MS = 3400;

/** Idle shell. The CSS fallback in `Island.svelte` must match these numbers. */
export const IDLE_BOX: IslandBox = { width: 118, height: 40, radius: 20 };

export function sameBox(a: IslandBox, b: IslandBox) {
	return a.width === b.width && a.height === b.height && a.radius === b.radius;
}

export function islandSizes(
	viewport: number,
	overrides?: Partial<Record<IslandStateId, Partial<IslandBox>>>
): Record<IslandStateId, IslandBox> {
	const max = Math.max(220, viewport - 36);

	const base: Record<IslandStateId, IslandBox> = {
		idle: IDLE_BOX,
		navigation: { width: Math.min(448, max), height: 60, radius: 30 },
		music: { width: Math.min(356, max), height: 96, radius: 28 },
		notification: { width: Math.min(332, max), height: 68, radius: 34 },
		timer: { width: Math.min(248, max), height: 84, radius: 26 }
	};

	if (!overrides) return base;

	for (const id of ISLAND_STATES) {
		const patch = overrides[id];
		if (patch) base[id] = { ...base[id], ...patch };
	}

	return base;
}
