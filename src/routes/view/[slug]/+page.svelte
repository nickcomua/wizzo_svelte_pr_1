<script lang="ts">
	import { store } from '$lib/store';
	import 'chart.js/auto';
	import 'chartjs-adapter-luxon';
	import { Col, Row, Container, Button, Input, Icon, Image, Form } from 'sveltestrap';
	import { afterNavigate, beforeNavigate } from '$app/navigation';

	export let data: { slug: any };

	let info: any = null;
	let statuses: any = {};
	let savestore = false;
	let fileinput: any;
	let priv_slug: any = null;
	let edit_flags: any

	$: if (savestore && $store) {
		window.sessionStorage.setItem('store', JSON.stringify($store));
	}

	afterNavigate(async () => {
		info = $store.main_config[data.slug];
		if (priv_slug != data.slug) {
			statuses = {};
			edit_flags = {
				name: false,
				description: false,
				statuses: {}
			};
			priv_slug = data.slug;
			console.log(data.slug);
			let ses = window.sessionStorage.getItem('store');
			if (ses) {
				//console.log('sob-- ~ loading ses', ses);
				$store = JSON.parse(ses);
			}
			savestore = true;

			console.log(info);
			statuses = Object.fromEntries(
				await Promise.all(
					Object.keys(info.funcs).map(async (id) => [
						id,
						await (await fetch(`http://localhost/getstatus.php?id=${id}`)).json()
					])
				)
			);
			// console.log(statuses);
			edit_flags = {
				name: false,
				description: false,
				statuses: Object.fromEntries(Object.keys(statuses).map((id) => [id, false]))
			};
		}
	});

	function onFileSelected(e: any) {
		let reader = new FileReader();
		reader.readAsDataURL(e.target.files[0]);
		reader.onload = (e) => {
			$store.main_config[data.slug].photo = e.target!.result ?? '';
			info = $store.main_config[data.slug];
		};
	}
</script>

{#if info}
	<Container>
		<Row>
			<Col>
				<h1>
					<Form
						on:submit={() => {
							edit_flags.name = !edit_flags.name;
						}}
					>
						{#if !edit_flags.name}
							{info.name}
						{:else}
							<Input
								style="width: 80%; display: inline-block"
								autofocus
								bind:value={$store.main_config[data.slug].name}
							/>
						{/if}
						<Button style="display: inline-block" outline type="submit"><Icon name="pen" /></Button>
					</Form>
				</h1>
				<h2>
					<Form
						on:submit={() => {
							edit_flags.description = !edit_flags.description;
						}}
					>
						{#if !edit_flags.description}
							{info.desription}
						{:else}
							<Input
								style="width: 80%; display: inline-block"
								autofocus
								bind:value={$store.main_config[data.slug].desription}
							/>
						{/if}
						<Button style="display: inline-block" outline><Icon name="pen" /></Button>
					</Form>
				</h2>
				{#each Object.keys(statuses) as id}
					<h3 style="white-space: nowrap">
						<Form
							on:submit={() => {
								edit_flags.statuses[id] = !edit_flags.statuses[id];
							}}
						>
							{#if !edit_flags.statuses[id]}
								<div style="display: inline-block">
									<Input
										type="switch"
										checked={statuses[id].status == 't'}
										label={`id${id}: ${info.funcs[id].name}`}
										on:change={async (e) => {
											if (
												'OK' !=
												(await (
													await fetch(
														`http://localhost/setstatus.php?id=${id}&status=${e.target.checked}`
													)
												).text())
											) {
												e.target.checked != e.target.checked;
											}
										}}
									/>
								</div>
							{:else if $store.main_config[data.slug].funcs[id]}
								<Input
									autofocus
									style="width: 80%; display: inline-block"
									bind:value={$store.main_config[data.slug].funcs[id].name}
								/>
							{/if}
							<Button style="display: inline-block" size="sm" outline><Icon name="pen" /></Button>
						</Form>
					</h3>
				{/each}
				<br />
				<h3>Indicators set sleep period:</h3>
				{#each Object.keys(statuses) as id}
					<h4>
						{info.funcs[id].name}:
						<Input
							type="number"
							style="width: auto; display: inline-block"
							value={statuses[id].sleep_time}
							on:change={(e) => {
								fetch(`http://localhost/setperiod.php?id=${id}&period=${e.target.value}`);
								//console.log(e.target.value);
							}}
						/>
					</h4>
				{/each}
			</Col>
			<Col>
				<div
					style="cursor: pointer;"
					on:click={() => {
						fileinput.click();
					}}
				>
					{#if typeof info.photo == 'string'}
						<Image value="photo" alt="pic" src={info.photo} style="max-width: 100%;" />
					{:else}
						<Image bind:this={info.photo} value="photo" alt="pic" style="max-width: 100%;" />
					{/if}
				</div>
				<input
					bind:this={fileinput}
					style="display:none"
					id="Upload"
					type="file"
					accept=".jpg, .jpeg, .png, .JPEG, .webp"
					on:change={(e) => onFileSelected(e)}
				/>
			</Col>
		</Row>
	</Container>
{/if}
