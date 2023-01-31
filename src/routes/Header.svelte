<script>
	import {
		Navbar,
		NavbarBrand,
		Nav,
		NavItem,
		Input,
		Styles,
		NavbarToggler,
		Collapse,
		NavLink,
		Col,
		Row,
		Icon,
		Container
	} from 'sveltestrap';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import logo from '$lib/images/svelte-logo.svg';
	import github from '$lib/images/github.svg';
	import { store } from '$lib/store';
	import { each } from 'svelte/internal';
	
	let isOpen = false;
</script>

<Styles />
<Navbar color="light" light>
	<NavbarBrand href="/">Home</NavbarBrand>
	<Nav class="ms-auto" navbar>
		<!-- <NavItem>
			<Input label="edit mode" type="switch" checked={true} />
		</NavItem> -->
	</Nav>
	<NavbarToggler on:click={() => (isOpen = !isOpen)} class="me-2" />
	<Collapse {isOpen} navbar>
		<Nav navbar>
			{#each Object.keys($store.main_config) as id}
			<NavItem>
				<NavLink style = "display: inline-block;" href='/view/{id}'>{$store.main_config[id].name}</NavLink>
				<NavLink style = "display: inline-block;" href='/chart/{id}'><Icon name="graph-up" /></NavLink>
			</NavItem>
			{/each}
			
			<NavItem>
				<NavLink href="/">Add new</NavLink>
			</NavItem>
		</Nav>
	</Collapse>
</Navbar>
