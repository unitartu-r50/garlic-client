import { writable } from 'svelte/store';

export const serverIPStore = writable(0);
export const isPepperConnected = writable(false);
export const motionsFetchNeeded = writable(true);
export const motions = writable([]);
export const speaker = writable('');
