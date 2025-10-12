export interface TwitchMessage {
	user: string;
	text: string;
}

export interface FrontendTwitchConnectionOptions {
	channel: string;
	onMessage: (message: TwitchMessage) => void;
	onError: (error: string) => void;
	onSystemMessage: (message: string) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
}

export class FrontendTwitchConnection {
	private ws: WebSocket | null = null;
	private connected = false;
	private keepAlive: ReturnType<typeof setInterval> | null = null;
	private connectionTimeout: ReturnType<typeof setTimeout> | null = null;
	private options: FrontendTwitchConnectionOptions;

	constructor(options: FrontendTwitchConnectionOptions) {
		this.options = options;
	}

	connect(): void {
		if (!this.options.channel || this.options.channel.trim() === '') {
			console.error('Channel name validation failed: empty or missing');
			this.options.onError('Channel name is required');
			return;
		}

		const tmiUrl = 'wss://irc-ws.chat.twitch.tv:443';

		try {
			this.ws = new WebSocket(tmiUrl);
		} catch (error) {
			console.error('Failed to create WebSocket:', error);
			this.options.onError('Failed to create WebSocket connection');
			return;
		}

		this.ws.onopen = () => {
			this.connected = true;

			if (this.connectionTimeout) {
				clearTimeout(this.connectionTimeout);
				this.connectionTimeout = null;
			}

			this.handleConnectionOpen();
		};

		this.ws.onmessage = (event: MessageEvent) => {
			this.handleMessage(event.data);
		};

		this.ws.onerror = (error: Event) => {
			console.error('WebSocket error:', error);
			console.error('Error details:', {
				type: error.type,
				target: error.target,
				currentTarget: error.currentTarget,
				timeStamp: error.timeStamp
			});
			if (!this.connected) {
				this.options.onError(`Twitch IRC connection error: ${error.type || 'Unknown error'}`);
				this.close('twitch error');
			}
		};

		this.ws.onclose = () => {
			this.options.onSystemMessage('Disconnected from Twitch IRC');
			this.close('twitch closed');
		};

		this.connectionTimeout = setTimeout(() => {
			if (!this.connected) {
				console.error('Connection timeout - failed to connect to Twitch IRC');
				this.options.onError('Connection timeout - failed to connect to Twitch IRC');
				this.close('connection timeout');
			}
		}, 10000);
	}

	private handleConnectionOpen(): void {
		if (!this.ws) return;

		const username = 'justinfan' + Math.floor(Math.random() * 100000);
		const cleanChannel = this.options.channel.replace(/^#/, '').toLowerCase().trim();

		try {
			this.ws.send('PASS SCHMOOPIIE');
			this.ws.send(`NICK ${username}`);
			this.ws.send(`JOIN #${cleanChannel}`);

			this.options.onSystemMessage(`Joined #${cleanChannel} as ${username}`);
			this.options.onConnect?.();

			this.keepAlive = setInterval(() => {
				if (this.connected && this.ws?.readyState === WebSocket.OPEN) {
				}
			}, 30000);
		} catch (error) {
			console.error('Error during Twitch IRC authentication:', error);
			this.options.onError('Failed to authenticate with Twitch IRC');
			this.close('auth error');
		}
	}

	private handleMessage(data: string | ArrayBuffer): void {
		const message = data.toString();

		if (message.startsWith('PING')) {
			this.ws?.send('PONG :tmi.twitch.tv');
			return;
		}

		if (message.includes('001')) {
		} else if (message.includes('JOIN')) {
		} else if (message.includes('ERROR') || message.includes('NOTICE')) {
			console.warn('Twitch IRC notice/error:', message);
			if (message.includes('Login authentication failed')) {
				this.options.onError('Authentication failed - please check channel name');
			} else if (message.includes('No such channel')) {
				this.options.onError('Channel does not exist or is not available');
			}
		} else if (message.includes('353')) {
		} else if (message.includes('366')) {
		}

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
		const cleanChannel = this.options.channel.replace(/^#/, '').toLowerCase().trim();
		const text = message.split('PRIVMSG #' + cleanChannel + ' :').at(1);

		if (!user || !text) return null;

		return { user, text };
	}

	close(reason?: string): void {
		if (this.keepAlive) {
			clearInterval(this.keepAlive);
			this.keepAlive = null;
		}

		if (this.connectionTimeout) {
			clearTimeout(this.connectionTimeout);
			this.connectionTimeout = null;
		}

		try {
			this.ws?.close();
		} catch {
			console.error('Error closing Twitch connection:', reason);
		}

		this.ws = null;
		this.connected = false;
		this.options.onDisconnect?.();
	}

	isConnected(): boolean {
		return this.connected && this.ws?.readyState === WebSocket.OPEN;
	}
}
