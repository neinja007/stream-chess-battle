import WebSocket from 'ws';

export interface TwitchMessage {
	user: string;
	text: string;
}

export interface TwitchConnectionOptions {
	channel: string;
	controller: ReadableStreamDefaultController<Uint8Array>;
	onMessage: (message: TwitchMessage) => void;
	onError: (error: string) => void;
	onSystemMessage: (message: string) => void;
}

export class TwitchConnection {
	private ws: WebSocket | null = null;
	private connected = false;
	private controllerClosed = false;
	private keepAlive: ReturnType<typeof setInterval> | null = null;
	private options: TwitchConnectionOptions;

	constructor(options: TwitchConnectionOptions) {
		this.options = options;
	}

	connect(): void {
		const tmiUrl = 'wss://irc-ws.chat.twitch.tv:443';
		this.ws = new WebSocket(tmiUrl);

		this.ws.on('open', () => {
			this.connected = true;
			this.handleConnectionOpen();
		});

		this.ws.on('message', (data: WebSocket.RawData) => {
			this.handleMessage(data);
		});

		this.ws.on('error', (err: unknown) => {
			this.options.onError(`Twitch IRC error: ${String(err)}`);
			this.close('twitch error');
		});

		this.ws.on('close', () => {
			this.options.onSystemMessage('Disconnected from Twitch IRC');
			this.close('twitch closed');
		});
	}

	private handleConnectionOpen(): void {
		if (!this.ws) return;

		const username = 'justinfan' + Math.floor(Math.random() * 100000);

		// Anonymous login
		this.ws.send('PASS SCHMOOPIIE');
		this.ws.send(`NICK ${username}`);
		this.ws.send(`JOIN #${this.options.channel}`);

		this.options.onSystemMessage(`Joined #${this.options.channel} as ${username}`);

		// Keep the SSE alive for proxies
		this.keepAlive = setInterval(() => {
			if (!this.controllerClosed) {
				this.options.controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
			}
		}, 15000);
	}

	private handleMessage(data: WebSocket.RawData): void {
		const message = data.toString();

		// Handle PING/PONG
		if (message.startsWith('PING')) {
			this.ws?.send('PONG :tmi.twitch.tv');
			return;
		}

		// Parse PRIVMSG
		const isPRIVMSG = message.includes('PRIVMSG');
		if (isPRIVMSG) {
			const parsedMessage = this.parsePrivMsg(message);
			if (parsedMessage) {
				this.options.onMessage(parsedMessage);
			}
		}
	}

	private parsePrivMsg(message: string): TwitchMessage | null {
		const user = message.split('!')[0].split(':').at(-1);
		const text = message.split('PRIVMSG #' + this.options.channel + ' :').at(1);

		if (!user || !text) return null;

		return { user, text };
	}

	close(reason?: string): void {
		this.controllerClosed = true;

		if (this.keepAlive) {
			clearInterval(this.keepAlive);
			this.keepAlive = null;
		}

		try {
			this.ws?.close();
		} catch {
			console.error('Error closing Twitch connection:', reason);
		}

		this.ws = null;
		this.connected = false;
	}

	isConnected(): boolean {
		return this.connected;
	}
}
