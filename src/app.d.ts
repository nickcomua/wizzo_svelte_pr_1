// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare module 'svelte-grid/build/helper/index.mjs';
declare module 'svelte-grid';
declare namespace App {
	// interface Error {}
	interface Locals {
		user: import('$lib/types').User;
	  }
	// interface PageData {}
	// interface Platform {}
}
