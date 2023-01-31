<script lang="ts">
	import { data, graphs_data } from '$lib/store';
	import { Scatter } from 'svelte-chartjs';
	import 'chart.js/auto';
	import colorLib from '@kurkle/color';
	import 'chartjs-adapter-luxon';
	import type { main_conf_type } from '$lib/types';
	import {
		Card,
		CardBody,
		CardDeck,
		CardFooter,
		CardImg,
		CardHeader,
		CardText,
		Image,
		Container,
		CardTitle,
		Icon,
		Button,
		Styles,
		Row,
		Col,
		Label
	} from 'sveltestrap';
	import { longpress } from './action';
	import { createEventDispatcher } from 'svelte';

	export let info: main_conf_type['id'];
	export let size: { h: number; w: number };
	export let id: string;

	const dispatch = createEventDispatcher();
	let st_labels: string[][];

	let options = {
		animation: false,
		display: true,
		responsive: true,
		maintainAspectRatio: false,
		interaction: {
			mode: 'nearest',
			axis: 'x',
			intersect: false
		},
		scales: {
			x: {
				// The axis for this scale is determined from the first letter of the id as `'x'`
				// It is recommended to specify `position` and / or `axis` explicitly.
				type: 'time'
			}
		}
	};

	$: info,
		(st_labels = info.funcs_graph_position.map((x) =>
			[...Array(x.point_quantity).keys()].map((i) => '' + (x.point_quantity - i - 1))
		));
	$: graph_height = (180 * size.h) / info.funcs_graph_position.slice(0, size.h).length;
</script>

<Styles />

<div
	use:longpress
	on:longpress={() => dispatch('long')}
	style="height: 100% !important; width: {240 * size.w}; padding: 0%; margin: 0%;"
>
	<Card style="padding: 2%; height: 100% !important; width: {240 * size.w}; ">
		<Container fluid style="height: 100% !important; width: {240 * size.w}; padding: 0%; ">
			<Row style="height: 220px; width: {240 * size.w}; padding: 0%; ">
				<Col md="auto">
					<h6 on:click style="cursor: pointer;" on:keypress>{info.name}</h6>
					<p style="font-size: 9px;">{info.desription}</p>
					{#each info.funcs_num_position.slice(0, size.h * 3) as i}
						<p style="margin: 0px;font-size: 9px;">
							{info.funcs[i].name}
						</p>
						{#if $data[i]}
							<h6>{$data[i].value}</h6>
						{/if}
					{/each}
				</Col>
				{#if (size.h !== 1 || size.w !== 1) && info.funcs_graph_position}
					<Col style="height: 100%;">
						{#each info.funcs_graph_position.slice(0, size.h) as v, i}
							<Row style="height: {graph_height}px !important;">
								<Scatter
									data={{
										datasets: v.graphs.map((x, j) => ({
											showLine: true,
											borderWidth: 1,
											label: info.funcs[x.id].name,
											data: $graphs_data[id][i][j],
											tension: 0,
											borderColor: x.color,
											backgroundColor: colorLib(x.color).alpha(0.5).rgbString()
										}))
									}}
									{options}
								/>
							</Row>
						{/each}
					</Col>
				{/if}
				<Col md="auto">
					<button
						on:click={() => {
							dispatch('edit_card');
						}}
						style="position: absolute; right: 50px; top: 10px"><Icon name="gear" /></button
					>
					<button
						on:click={() => {
							dispatch('goto_graph');
						}}
						style="position: absolute;right: 10px; top: 10px"><Icon name="graph-up" /></button
					>
					<a style="cursor: pointer;" href="/view/{id}">
						{#if info.photo_flag}
							<div style="height: 80px;" />
							{#if typeof info.photo == 'string'}
								<Image
									value="photo"
									alt="pic"
									src={info.photo}
									style="max-width: 100px;max-height: 100px;"
								/>
							{:else}
								<Image
									bind:this={info.photo}
									value="photo"
									alt="pic"
									style="max-width: 100px;max-height: 100px;"
								/>
							{/if}
						{/if}
					</a>
				</Col>
			</Row>
		</Container>
	</Card>
</div>
