<script lang="ts">
	type Props = {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		display: string;
		oninput: (value: number) => void;
	};

	let { label, value, min, max, step, display, oninput }: Props = $props();
	const id = $props.id();
</script>

<div class="row">
	<label for={id}>
		<span>{label}</span>
		<span class="value">{display}</span>
	</label>
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		{value}
		oninput={(event) => oninput(Number(event.currentTarget.value))}
	/>
</div>

<style>
	.row {
		display: grid;
		gap: 2px;
	}

	label {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		font-size: 13px;
		font-weight: 500;
	}

	.value {
		color: var(--muted);
		font-variant-numeric: tabular-nums;
		font-weight: 450;
	}

	input[type='range'] {
		width: 100%;
		height: 28px;
		margin: 0;
		appearance: none;
		background: transparent;
		cursor: pointer;
	}

	input[type='range']:focus-visible {
		outline: none;
	}

	input[type='range']::-webkit-slider-runnable-track {
		height: 2px;
		border-radius: 999px;
		background: var(--line);
	}

	input[type='range']::-webkit-slider-thumb {
		width: 16px;
		height: 16px;
		margin-top: -7px;
		appearance: none;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
		box-shadow: 0 0 0 4px var(--bg);
	}

	input[type='range']:focus-visible::-webkit-slider-thumb {
		box-shadow:
			0 0 0 4px var(--bg),
			0 0 0 6px var(--ink);
	}

	input[type='range']::-moz-range-track {
		height: 2px;
		border: 0;
		border-radius: 999px;
		background: var(--line);
	}

	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border: 0;
		border-radius: 50%;
		background: var(--ink);
	}
</style>
