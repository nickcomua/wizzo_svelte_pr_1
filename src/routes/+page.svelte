<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from './Card.svelte';
	import Grid from 'svelte-grid';
	import MultiSelect from 'svelte-multiselect';
	import {
		Button,
		Form,
		Label,
		Modal,
		ModalBody,
		Navbar,
		NavbarBrand,
		Nav,
		NavItem,
		NavLink,
		ModalFooter,
		ModalHeader,
		Input,
		Container,
		Row,
		Col,
		FormGroup,
		ButtonToolbar,
		Image
	} from 'sveltestrap';
	import gridHelp from 'svelte-grid/build/helper/index.mjs';
	import { store } from '$lib/store';
	import type { main_conf_type, table_type } from '$lib/types';
	import { onMount } from 'svelte';

	let savestore = false;
	let width: number;
	let container: HTMLElement;
	let active = ['1', '2', '3']; // list of active machins
	let edit_mode = false;
	let starting = true;
	let colums_c = 8;

	//modal part
	let modal_edit_card: string | null = null;

	$: if (savestore && $store) {
		window.sessionStorage.setItem('store', JSON.stringify($store));
	}

	$: edit_mode, change_to_editmode();
	
	let old_w = 0;
	$: if (width)
		if (Math.floor(width / 240) != old_w) {
			old_w = Math.floor(width / 240);
			console.log(old_w);
			if (old_w) {
				colums_c = Math.max(1, Math.min(old_w, 8));
				//$store.grid_config = gridHelp.adjust($store.grid_config, c);
			}
		}

	$: cols = [[1200, [colums_c]]]; // thing for grid

	$: grid_card_info = $store.grid_config.findIndex((x) => x.id == '' + modal_edit_card);

	function generate_start_items(active_items: Array<string>, colum_count: number): table_type {
		let ans: any = [];
		active_items.forEach((element, index) => {
			ans = [
				...ans,
				{
					[8]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[7]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[6]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[5]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[4]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[3]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[2]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					[1]: gridHelp.item({
						x: (index * 2) % colum_count,
						y: Math.floor((index * 2) / colum_count),
						w: 2,
						h: 1,
						max: { w: 6, h: 4 },
						draggable: edit_mode,
						resizable: edit_mode
					}),
					id: element
				}
			];
		});
		return ans;
	}

	function change_to_editmode() {
		console.log($store.grid_config, starting);
		if (starting) {
			starting = false;
			$store.grid_config = $store.grid_config;
		} else {
			$store.grid_config = $store.grid_config.map((x) => {
				x[colums_c].draggable = edit_mode;
				x[colums_c].resizable = edit_mode;
				return x;
			});
			console.log($store.grid_config);
			$store.grid_config = $store.grid_config;
		}
	}
	
	function onFileSelected(e: any){
		let image = e.target.files[0];
		let reader = new FileReader();
		reader.readAsDataURL(image);
		reader.onload = (e) => {
			$store.main_config[modal_edit_card ?? '0'].photo = e.target!.result ?? '';
		};
	};

	onMount(async () => {
		container = document.documentElement;
		//window.sessionStorage.removeItem("store");
		let ses = window.sessionStorage.getItem('store');
		if (ses) {
			//console.log('sob-- ~ loading ses', ses);
			$store = JSON.parse(ses);
		} else {
			$store.grid_config = generate_start_items(active, colums_c);
		}
		savestore = true;
	});

	//logs
	// $: console.log(modal_edit_card ?? 'null');
	// $: console.log(grid_card_info ?? 'null');
</script>

<svelte:window bind:innerWidth={width} />
{#if width < 778}
	to small width
{:else}
	<Grid
		scroller={container}
		bind:items={$store.grid_config}
		rowHeight={220}
		let:item
		let:dataItem
		{cols}
		let:index
	>
		<Card
			on:long={() => (edit_mode = !edit_mode)}
			on:goto_graph={() => {
				goto(`/chart/${dataItem.id}`);
			}}
			info={$store.main_config[dataItem.id]}
			id={dataItem.id}
			size={{ w: item.w, h: item.h }}
			on:edit_card={() => {
				modal_edit_card = dataItem.id;
			}}
			on:click={() => {
				goto(`/view/${dataItem.id}`);
			}}
		/>
	</Grid>
{/if}

{#if grid_card_info != null && modal_edit_card != null}
	<Modal
		size="xl"
		isOpen={modal_edit_card !== null}
		toggle={() => {
			modal_edit_card = null;
		}}
		scrollable
	>
		<ModalHeader
			toggle={() => {
				modal_edit_card = null;
			}}>Edit card</ModalHeader
		>
		<ModalBody>
			<div
				style="height: {210 * $store.grid_config[grid_card_info][colums_c].h}px; width: {Math.max(
					40,
					(100 * $store.grid_config[grid_card_info][colums_c].w) / colums_c
				)}%;   margin-left: auto; margin-right: auto;"
			>
				<Card
					id={modal_edit_card}
					info={$store.main_config[modal_edit_card]}
					size={{ ...$store.grid_config[grid_card_info][colums_c] }}
				/>
			</div>
			<Form>
				<Container>
					<Row>
						<Col>
							<FormGroup>
								<Label for="HeightRange">Height Range</Label>
								<Input
									type="range"
									name="range"
									id="HeightRange"
									min={$store.grid_config[grid_card_info][colums_c].min.h}
									max={$store.grid_config[grid_card_info][colums_c].max.h}
									step={1}
									bind:value={$store.grid_config[grid_card_info][colums_c].h}
									placeholder="Range placeholder"
								/>
							</FormGroup>
							<FormGroup>
								<Label for="Name">Mashin Name</Label>
								<Input
									id="Name"
									type="text"
									name="Machine name"
									bind:value={$store.main_config[modal_edit_card].name}
								/>
							</FormGroup>
							<FormGroup>
								<Label for="Decription">Mashin Decription</Label>
								<Input
									id="Decription"
									type="text"
									name="Machine name"
									bind:value={$store.main_config[modal_edit_card].desription}
								/>
							</FormGroup>
							<FormGroup>
								<Label for="num_func">Select numerical indicators and their order</Label>
								<MultiSelect
									id="num_func"
									bind:selected={$store.main_config[modal_edit_card].funcs_num_position}
									options={Object.keys($store.main_config[modal_edit_card].funcs)}
								>
									<span let:option slot="option"
										>id:{option};{$store.main_config[modal_edit_card].funcs[
											typeof option === 'string' ? option : ''
										].name}</span
									>
									<span let:option slot="selected"
										>id:{option};{$store.main_config[modal_edit_card].funcs[
											typeof option === 'string' ? option : ''
										].name}</span
									>
								</MultiSelect>
							</FormGroup>
							<FormGroup>
								{#each Object.keys($store.main_config[modal_edit_card].funcs) as i}
									<Label for="func id {i}">Name for func with id {i}</Label>
									<Input
										id="func id {i}"
										type="text"
										name="name for id {i}"
										bind:value={$store.main_config[modal_edit_card].funcs[i].name}
									/>
								{/each}
							</FormGroup>
						</Col>
						<Col>
							<FormGroup>
								<Label for="WidthRange">Width Range</Label>
								<Input
									type="range"
									name="range"
									id="WidthRange"
									min={$store.grid_config[grid_card_info][colums_c].min.w}
									max={$store.grid_config[grid_card_info][colums_c].max.w}
									step={1}
									bind:value={$store.grid_config[grid_card_info][colums_c].w}
								/>
							</FormGroup>
							<FormGroup>
								<Input
									id="PhotoToggel"
									label="turn on/off photo"
									type="switch"
									bind:checked={$store.main_config[modal_edit_card].photo_flag}
								/>
							</FormGroup>
							{#if $store.main_config[modal_edit_card].photo_flag}
								<FormGroup>
									<Label for="Upload">Upload photo</Label>
									<Input
										id="Upload"
										type="file"
										accept=".jpg, .jpeg, .png, .JPEG, .webp"
										on:change={(e) => onFileSelected(e)}
									/>
								</FormGroup>
							{/if}
							<FormGroup />
							<FormGroup>
								<Label for="change_graphs">Change graphs</Label>
								<ButtonToolbar>
									<Button
										type="button"
										color="success"
										on:click={() => {
											if (!modal_edit_card || !grid_card_info) return;
											$store.main_config[modal_edit_card].funcs_graph_position = [
												...$store.main_config[modal_edit_card].funcs_graph_position,
												{ graphs: [], point_quantity: 10 }
											];
											$store.grid_config[grid_card_info][colums_c].min.h =
												$store.main_config[modal_edit_card].funcs_graph_position.length;
											$store.grid_config[grid_card_info][colums_c].h = Math.max(
												$store.grid_config[grid_card_info][colums_c].min.h,
												$store.grid_config[grid_card_info][colums_c].h
											);
											$store.grid_config[grid_card_info][colums_c].w = 2;
										}}>Add</Button
									>
									<Button
										type="button"
										color="danger"
										on:click={() => {
											if (!modal_edit_card || !grid_card_info) return;
											$store.main_config[modal_edit_card].funcs_graph_position = [];
											$store.grid_config[grid_card_info][colums_c].min.h = 1;
										}}>Remove All</Button
									>
								</ButtonToolbar>
							</FormGroup>
							<FormGroup>
								{#each Object.keys($store.main_config[modal_edit_card].funcs_graph_position) as element, index}
									<Label for="num_func">Pick func(s) and color(s) for Graph N{index}</Label>
									<MultiSelect
										id="num_func"
										selected={$store.main_config[modal_edit_card].funcs_graph_position[
											index
										].graphs.map((x) => x.id)}
										options={Object.keys($store.main_config[modal_edit_card].funcs)}
										on:change={(e) => {
											if (!modal_edit_card || !grid_card_info) return;
											if (e.detail.type === 'add')
												$store.main_config[modal_edit_card].funcs_graph_position[index].graphs = [
													...$store.main_config[modal_edit_card].funcs_graph_position[index].graphs,
													{
														id: typeof e.detail.option === 'string' ? e.detail.option : '',
														color: '#000000'
													}
												];
											if (e.detail.type === 'remove')
												$store.main_config[modal_edit_card].funcs_graph_position[index].graphs =
													$store.main_config[modal_edit_card].funcs_graph_position[
														index
													].graphs.filter((x) => x.id != e.detail.option);
											if (e.detail.type === 'removeAll')
												$store.main_config[modal_edit_card].funcs_graph_position[index].graphs = [];
										}}
									>
										<span let:option slot="option"
											>id:{option};{$store.main_config[modal_edit_card].funcs[
												typeof option === 'string' ? option : ''
											].name}</span
										>
										<span let:option slot="selected" let:idx
											>id:{option};{$store.main_config[modal_edit_card].funcs[
												typeof option === 'string' ? option : ''
											].name}
											<Input
												style="padding: 0px; margin: 0px; height: 7px;"
												type="color"
												name="color"
												id="exampleColor"
												bind:value={$store.main_config[modal_edit_card].funcs_graph_position[index]
													.graphs[idx].color}
												placeholder="color placeholder"
											/>
											<!-- on:change={()=>{console.log($store.main_config[modal_edit_card].funcs_graph_position[index].graphs[idx].color);}} -->
										</span>
									</MultiSelect>
									<Label for="rangeNumber">Points range for Graph N{index}</Label>
									<Input
										type="number"
										name="rangeNumber"
										id="rangeNumber"
										placeholder="rangeNumber"
										bind:value={$store.main_config[modal_edit_card].funcs_graph_position[index]
											.point_quantity}
									/>
								{/each}
							</FormGroup>
						</Col>
					</Row>
				</Container>
			</Form>
		</ModalBody>
	</Modal>
{/if}
