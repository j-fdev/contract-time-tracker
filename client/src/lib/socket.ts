import { io } from 'socket.io-client';

/** One shared connection. Same origin, so the Vite proxy forwards it with the session cookie. */
export const socket = io({ autoConnect: false, withCredentials: true });
