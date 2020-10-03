
import { writable, derived } from 'svelte/store';
import { formatTimeStr } from "./utils.js";

export const alertObj = writable({});

export const message = writable("");
export const createdAt = writable(new Date());
export const nextAlert = writable(new Date());
export const currentTime = writable(new Date());
export const stop = writable(true);
export const alertBox = writable(false);
export const timeString = derived([nextAlert, currentTime], formatTimeStr);
export const interval = writable(undefined);

