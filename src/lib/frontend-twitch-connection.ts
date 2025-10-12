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
		console.log('Starting Twitch connection process...');

		// Validate channel name
		if (!this.options.channel || this.options.channel.trim() === '') {
			console.error('Channel name validation failed: empty or missing');
			this.options.onError('Channel name is required');
			return;
		}

		// Clean channel name (remove # if present, convert to lowercase)
		const cleanChannel = this.options.channel.replace(/^#/, '').toLowerCase().trim();
		if (cleanChannel !== this.options.channel) {
			console.log(`Cleaned channel name: "${this.options.channel}" -> "${cleanChannel}"`);
		}

		const tmiUrl = 'wss://irc-ws.chat.twitch.tv:443';
		console.log('Connecting to Twitch IRC:', tmiUrl, 'for channel:', cleanChannel);

		try {
			this.ws = new WebSocket(tmiUrl);
			console.log('WebSocket created successfully');
		} catch (error) {
			console.error('Failed to create WebSocket:', error);
			this.options.onError('Failed to create WebSocket connection');
			return;
		}

		this.ws.onopen = () => {
			console.log('WebSocket connection opened');
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
		console.log('Authenticating with Twitch IRC as:', username);

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
			console.log('Successfully authenticated with Twitch IRC');
		} else if (message.includes('JOIN')) {
			console.log('Successfully joined channel');
		} else if (message.includes('ERROR') || message.includes('NOTICE')) {
			console.warn('Twitch IRC notice/error:', message);
			if (message.includes('Login authentication failed')) {
				this.options.onError('Authentication failed - please check channel name');
			} else if (message.includes('No such channel')) {
				this.options.onError('Channel does not exist or is not available');
			}
		} else if (message.includes('353')) {
			// RPL_NAMREPLY - user list received
			console.log('Received user list for channel');
		} else if (message.includes('366')) {
			// RPL_ENDOFNAMES - end of user list
			console.log('Finished receiving user list');
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
