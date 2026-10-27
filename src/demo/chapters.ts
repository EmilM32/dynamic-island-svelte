export const chapters = [
	{
		id: 'motion',
		label: 'Motion',
		body: 'The shell is one spring on width, height, and corner radius. The words live in a layer already sized for the destination, and they only fade, blur, and rise. Drag the sliders mid-flight — stiffness and damping are read on every frame.'
	},
	{
		id: 'states',
		label: 'States',
		body: 'Idle, menu, player, alert, timer. Each one is a snippet you write. The island does not know what a song is. It only knows which box to become, and how to get there without stretching the type.'
	},
	{
		id: 'api',
		label: 'API',
		body: 'Pass a state in. Listen for oncollapse. Override a size when your content needs a different box. The package is dynamic-island-svelte — the faces on this page are just the demo.'
	},
	{
		id: 'keys',
		label: 'Keys',
		body: 'The menu is one tab stop. Arrows, Home, and End move inside it. Escape closes, and focus returns to the control that opened it. An alert announces itself, then folds away on its own.'
	},
	{
		id: 'use',
		label: 'Use',
		body: 'Ship it in a product. The package is MIT. Reduced motion snaps the spring and drops the blur, so the same component stays usable when the animation should not play.'
	}
] as const;

export type ChapterId = (typeof chapters)[number]['id'];
