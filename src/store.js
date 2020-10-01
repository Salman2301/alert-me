
import { writable } from 'svelte/store';

export const alertObj = writable({});

export const message = writable("I am writing code in Wix.");
export const createdAt = writable(new Date());
export const nextAlert = writable(new Date());
export const stop = writable(true);
