import { error } from '@sveltejs/kit';
import type { PageLoad } from '../$types';
// @type {import('./$types').PageLoad} 
export function load({ params } : any) { 
    return {
      slug: params.slug
    }; 

}