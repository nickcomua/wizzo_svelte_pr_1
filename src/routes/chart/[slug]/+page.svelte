<script lang="ts">
	// @type {import('./$types').PageData}
	import { Scatter } from 'svelte-chartjs';
	import { store } from '$lib/store';
	import { page } from '$app/stores';
	import colorLib from '@kurkle/color';
	import 'chart.js/auto';
	import RangeSlider from 'svelte-range-slider-pips';
	import 'chartjs-adapter-luxon';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { Col, Row, Container, Button, Input } from 'sveltestrap';
	import { downsample } from 'downsample-lttb-ts';
	import type { main_conf_type } from '$lib/types';

	export let data: { title: string };

	let indicators: main_conf_type['id']['funcs'];
	let default_min: number;
	let default_max: number;
	let curent_min: number;
	let curent_max: number;
	let range: number[] = [0, 1];
	let priv_slug: null|string = null;
	let grap_data: {[id:string]:number[][]} = {};
	let options = {
		//parsing : false,
		//type: 'line',
		animation: false,
		display: true,
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'nearest',
			axis: 'x',
			intersect: false
		},
		// plugins:{
		//     decimation:
		//     {
		//         enabled: true,
		//         algorithm: 'lttb',
		//         samples: 50
		//     }
		// },
		scales: {
			x: {
				// The axis for this scale is determined from the first letter of the id as `'x'`
				// It is recommended to specify `position` and / or `axis` explicitly.
				type: 'time',
				ticks: {
					source: 'auto',
					// Disabled rotation for performance
					maxRotation: 0,
					autoSkip: true
				}
			}
		}
	};
	let threshold = [-1];

	afterNavigate(async () => {
		indicators = $store.main_config[data.title].funcs;

		if (priv_slug != data.title) {
			grap_data = {};
			priv_slug = data.title;
			let ses = window.sessionStorage.getItem('store');
			if (ses) {
				console.log('sob-- ~ loading ses', ses);
				$store = JSON.parse(ses);
			}

			indicators = $store.main_config[data.title].funcs;
			const statuses = await Promise.all(
				Object.keys(indicators).map(
					async (id) => await (await fetch(`http://localhost/getstatus.php?id=${id}`)).json()
				)
			);

			console.log(statuses);
			default_min = Math.min(...statuses.map((x) => parseFloat(x.mintime))) * 1000;
			default_max = Math.max(...statuses.map((x) => parseFloat(x.maxtime))) * 1000;
			//console.log(default_max);

			curent_min = default_min;
			curent_max = default_max;
			range = [curent_min, curent_max];
			take_data();
		}
	});

	async function take_data() {
		grap_data = await Object.fromEntries(
			await Promise.all(
				Object.keys(indicators).map(async (id) => [
					id,
					await fetch(
						`http://localhost/startenddata.php?id=${id}&time_start=${new Date(
							range[0]
						).toISOString()}&time_end=${new Date(range[1]).toISOString()}`
					)
						.then((x) => x.json())
						.then((temp: { stime: string; temperature: string }[]) =>
							temp.map((x) => [new Date(parseFloat(x.stime) * 1000), parseFloat(x.temperature)])
						)
				])
			)
		);
		// grap_data = Object.keys(indicators).map(async (key) =>
		//     await (await fetch(`http://localhost/startenddata.php?id=${key}&time_start=${(new Date(range[0])).toISOString()}&time_end=${(new Date(range[1])).toISOString()}`))
		//         .json()
		//     )
		// for (const key in indicators) {
		//     if (Object.prototype.hasOwnProperty.call(indicators, key)) {
		//         const element = indicators[key];
		//         console.log(element);
		//         fetch(`http://localhost/startenddata.php?id=${key}&time_start=${(new Date(range[0])).toISOString()}&time_end=${(new Date(range[1])).toISOString()}`)
		//         .then(x => x.json())
		//         .then(val => {grap_data.push({showLine: true,data: val.map((x:any) => [new Date(parseFloat(x.stime)*1000),x.temperature]), label: indicators[key].name})})
		//         console.log(grap_data);
		//  console.log(Object.keys(indicators).map(id => ({showLine: true,label: indicators[id].name,data: indicators[id].data})));
		//     }
		// }
		curent_min = range[0];
		curent_max = range[1];
		// fetch(`http://localhost/lastnvalue.php?id=${final.id}&n=${val.point_quantity}`).
		//                 then(x => x.json()).
		//                 then((temp: { stime: string, temperature: string }[]) =>
		//                     {temp.map(x => [Math.min(0,parseFloat(x.stime) - (Date.now() / 1000) - 3600), parseFloat(x.temperature)])}
		//                 )
	}
</script>

{#if indicators}
	<Container>
		<Row>
			{#if Object.keys(grap_data).length != 0}
				<Scatter
					data={{
						datasets: Object.keys(grap_data).map((id) => ({
							borderWidth: 1,
							radius: 0,
							showLine: true,
							label: indicators[id].name,
							data: downsample({ series: grap_data[id], threshold: threshold[0] })
						}))
					}}
					{options}
				/>
			{/if}
		</Row>
		<Row>
			<Col md>
				<Button
					style="width: 100%;"
					on:click={() => {
						curent_min = default_min;
						curent_max = default_max;
						range = [curent_min, curent_max];
						take_data();
					}}>Reset zoom</Button
				>
			</Col>
		</Row>
		<Row>
			<Col>
				<RangeSlider
					on:stop={(e) => {
						take_data();
					}}
					bind:values={range}
					range
					min={curent_min}
					max={curent_max}
				/>
			</Col>
		</Row>
		<Row>
			<Col md="auto">
				<Input
					value={new Date(range[0]).toISOString().substring(0, 23)}
					on:input={(e) => {
						var outp = new Date(e.srcElement.value).getTime();
						if (outp) {
							range[0] = outp;
						}
						take_data();
					}}
					type="datetime-local"
					name="datetime"
					id="exampleDatetime"
					placeholder="datetime placeholder"
				/>
			</Col>
			<Col>
				<!-- <Button style="width: 100%;" on:click={take_data}>Show</Button> -->
			</Col>
			<Col md="auto">
				<Input
					value={new Date(range[1]).toISOString().substring(0, 23)}
					on:input={(e) => {
						var outp = new Date(e.srcElement.value).getTime();
						if (outp) {
							range[1] = outp;
						}
						take_data();
					}}
					type="datetime-local"
					name="datetime"
					id="exampleDatetime"
					placeholder="datetime placeholder"
				/>
			</Col>
		</Row>
		<Row>
			<Col md="auto" style="margin-top: 10px;">
				<Input
					checked={threshold[0] != -1}
					on:change={(e) => {
						if (e.target.checked) threshold[0] = 50;
						else threshold[0] = -1;
					}}
					type="switch"
					label="Downsample"
				/>
			</Col>
			<Col>
				{#if threshold[0] != -1}
					<RangeSlider bind:values={threshold} pips range min={1} max={200} />
				{/if}
			</Col>
		</Row>
	</Container>
{/if}
