import { writeSse } from './sse-utils';

export interface ConnectionManagerOptions {
	controller: ReadableStreamDefaultController<Uint8Array>;
	onClientAbort?: () => void;
}

export class ConnectionManager {
	private connected = false;
	private controllerClosed = false;
	private keepAlive: ReturnType<typeof setInterval> | null = null;
	private options: ConnectionManagerOptions;

	constructor(options: ConnectionManagerOptions) {
		this.options = options;
	}

	setConnected(connected: boolean): void {
		this.connected = connected;
	}

	isConnected(): boolean {
		return this.connected;
	}

	startKeepAlive(): void {
		this.keepAlive = setInterval(() => {
			this.options.controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
		}, 15000);
	}

	stopKeepAlive(): void {
		if (this.keepAlive) {
			clearInterval(this.keepAlive);
			this.keepAlive = null;
		}
	}

	close(reason?: string): void {
		this.stopKeepAlive();
		this.controllerClosed = true;

		if (!this.connected) {
			this.options.controller.error(new Error(reason || 'Connection closed'));
		} else {
			this.options.controller.close();
		}
	}

	sendSystemMessage(message: string): void {
		if (this.controllerClosed) return;
		writeSse(this.options.controller, 'system', { message });
	}

	sendErrorMessage(message: string, error?: string): void {
		if (this.controllerClosed) return;
		writeSse(this.options.controller, 'error', { message, error });
	}

	setupClientAbortHandler(req: Request): void {
		req.signal.addEventListener('abort', () => {
			this.sendSystemMessage('Client disconnected');
			this.options.onClientAbort?.();
			this.close('client aborted');
		});
	}
}
