export interface YouTubeMessage {
	user: string;
	text: string;
}

export interface FrontendYouTubeConnectionOptions {
	channel: string;
	apiKey: string;
	onMessage: (message: YouTubeMessage) => void;
	onError: (error: string) => void;
	onSystemMessage?: (message: string) => void;
	onConnect?: () => void;
	onDisconnect?: () => void;
}

export class FrontendYouTubeConnection {
	private connected = false;
	private pollingTimeout: ReturnType<typeof setTimeout> | null = null;
	private keepAlive: ReturnType<typeof setInterval> | null = null;
	private liveChatId: string | null = null;
	private nextPageToken: string | null = null;
	private pollingIntervalMs: number = 5000;
	private readonly apiKey: string | undefined;
	private readonly options: FrontendYouTubeConnectionOptions;

	constructor(options: FrontendYouTubeConnectionOptions) {
		this.options = options;
		this.apiKey = options.apiKey;
	}

	connect(): void {
		if (!this.options.channel || this.options.channel.trim() === '') {
			this.options.onError('YouTube channel is required');
			return;
		}

		if (!this.apiKey) {
			this.options.onError('Missing API key for YouTube API');
			return;
		}

		this.connected = true;
		this.options.onSystemMessage?.(`Connecting to YouTube Live Chat for channel: ${this.options.channel}`);

		this.initialize().catch((err) => {
			this.options.onError(`YouTube init error: ${String(err)}`);
			this.close();
		});
	}

	private async initialize(): Promise<void> {
		const liveChatId = await this.getLiveChatId();
		if (!this.connected) return;
		if (!liveChatId) {
			throw new Error('Could not find live chat for this channel');
		}
		this.liveChatId = liveChatId;

		this.options.onSystemMessage?.('Connected to YouTube Live Chat');
		this.options.onConnect?.();

		this.keepAlive = setInterval(() => {
			// no-op in frontend; used to signal activity cadence
		}, 15000);

		this.pollMessages();
	}

	private async getLiveChatId(): Promise<string | null> {
		try {
			const channelHandle = this.options.channel.trim();
			const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${encodeURIComponent(
				channelHandle
			)}&key=${this.apiKey}`;
			const channelIdResp = await fetch(channelsUrl);
			if (!channelIdResp.ok) {
				throw new Error(`Failed channels lookup: ${channelIdResp.status}`);
			}
			const channelIdData = await channelIdResp.json();
			const actualChannelId: string | undefined = channelIdData?.items?.[0]?.id;
			if (!actualChannelId) return null;

			const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&eventType=live&type=video&key=${this.apiKey}`;
			const searchResp = await fetch(searchUrl);
			if (!searchResp.ok) {
				throw new Error(`Failed to search for live streams: ${searchResp.status}`);
			}
			const searchData = await searchResp.json();
			const videoId: string | undefined = searchData?.items?.[0]?.id?.videoId;
			if (!videoId) return null;

			const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${this.apiKey}`;
			const videoResp = await fetch(videoUrl);
			if (!videoResp.ok) {
				throw new Error(`Failed to get video details: ${videoResp.status}`);
			}
			const videoData = await videoResp.json();
			const activeLiveChatId: string | undefined = videoData?.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
			return activeLiveChatId ?? null;
		} catch (err) {
			console.error('Error getting live chat ID:', err);
			return null;
		}
	}

	private async pollMessages(): Promise<void> {
		if (!this.connected || !this.liveChatId) return;
		try {
			const url = new URL('https://www.googleapis.com/youtube/v3/liveChat/messages');
			url.searchParams.set('liveChatId', this.liveChatId);
			url.searchParams.set('part', 'snippet,authorDetails');
			url.searchParams.set('key', this.apiKey!);
			if (this.nextPageToken) url.searchParams.set('pageToken', this.nextPageToken);

			const resp = await fetch(url.toString());
			if (!resp.ok) {
				if (resp.status === 403) {
					throw new Error('YouTube API quota exceeded or access denied');
				}
				throw new Error(`Failed to fetch chat messages: ${resp.status}`);
			}

			const data = (await resp.json()) as {
				items: Array<{ snippet: { displayMessage: string }; authorDetails: { displayName: string } }>;
				nextPageToken?: string;
				pollingIntervalMillis?: number;
			};

			this.pollingIntervalMs = data.pollingIntervalMillis ?? this.pollingIntervalMs;
			this.nextPageToken = data.nextPageToken ?? null;

			for (const message of data.items ?? []) {
				const user = message.authorDetails?.displayName;
				const text = message.snippet?.displayMessage;
				if (user && text) {
					this.options.onMessage({ user, text });
				}
			}
		} catch (err) {
			console.error('Error fetching YouTube chat messages:', err);
			this.options.onError(String(err));
		} finally {
			if (this.connected) {
				this.pollingTimeout = setTimeout(() => this.pollMessages(), this.pollingIntervalMs);
			}
		}
	}

	close(): void {
		if (this.keepAlive) {
			clearInterval(this.keepAlive);
			this.keepAlive = null;
		}
		if (this.pollingTimeout) {
			clearTimeout(this.pollingTimeout);
			this.pollingTimeout = null;
		}
		this.connected = false;
		this.liveChatId = null;
		this.nextPageToken = null;
		this.options.onDisconnect?.();
	}

	isConnected(): boolean {
		return this.connected;
	}
}
