export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function writeSse(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
	const payload = typeof data === 'string' ? data : JSON.stringify(data);
	const sse = `event: ${event}\n` + `data: ${payload}\n\n`;
	controller.enqueue(new TextEncoder().encode(sse));
}

interface YouTubeLiveChatMessage {
	id: string;
	snippet: {
		displayMessage: string;
		publishedAt: string;
		authorChannelId: string;
	};
	authorDetails: {
		displayName: string;
		profileImageUrl: string;
		isVerified: boolean;
		isChatOwner: boolean;
		isChatModerator: boolean;
		isChatSponsor: boolean;
	};
}

interface YouTubeLiveChatResponse {
	items: YouTubeLiveChatMessage[];
	nextPageToken?: string;
	pollingIntervalMillis: number;
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const channelId = searchParams.get('channel_id');
	if (!channelId) {
		return new Response(JSON.stringify({ error: 'Missing required query param: channel_id' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const apiKey = process.env.GCC_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
			status: 500,
			headers: { 'content-type': 'application/json' }
		});
	}

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let keepAlive: ReturnType<typeof setInterval> | null = null;
			let connected = false;
			let liveChatId: string | null = null;
			let nextPageToken: string | null = null;
			let pollingInterval: number = 5000; // Default 5 seconds

			const closeAll = (reason?: string) => {
				if (keepAlive) {
					clearInterval(keepAlive);
					keepAlive = null;
				}
				if (!connected) {
					controller.error(new Error(reason || 'Connection closed'));
				} else {
					controller.close();
				}
			};

			const getLiveChatId = async (): Promise<string | null> => {
				try {
					const channelIdResponse = await fetch(
						`https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${channelId}&key=${apiKey}`
					);
					const channelIdData = await channelIdResponse.json();
					const actualChannelId = channelIdData.items[0].id;

					const searchResponse = await fetch(
						`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${actualChannelId}&eventType=live&type=video&key=${apiKey}`
					);

					if (!searchResponse.ok) {
						throw new Error(`Failed to search for live streams: ${searchResponse.status}`);
					}

					const searchData = await searchResponse.json();
					if (!searchData.items || searchData.items.length === 0) {
						throw new Error('No live streams found for this channel');
					}

					const videoId = searchData.items[0].id.videoId;

					console.log('videoId', videoId);

					const videoResponse = await fetch(
						`https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`
					);

					if (!videoResponse.ok) {
						throw new Error(`Failed to get video details: ${videoResponse.status}`);
					}

					const videoData = await videoResponse.json();
					if (!videoData.items || videoData.items.length === 0) {
						throw new Error('Video not found');
					}

					const liveChatId = videoData.items[0].liveStreamingDetails?.activeLiveChatId;
					if (!liveChatId) {
						throw new Error('Live chat is not available for this stream');
					}

					return liveChatId;
				} catch (error) {
					console.error('Error getting live chat ID:', error);
					return null;
				}
			};

			const fetchChatMessages = async () => {
				if (!liveChatId) return;

				try {
					const url = new URL('https://www.googleapis.com/youtube/v3/liveChat/messages');
					url.searchParams.set('liveChatId', liveChatId);
					url.searchParams.set('part', 'snippet,authorDetails');
					url.searchParams.set('key', apiKey);
					if (nextPageToken) {
						url.searchParams.set('pageToken', nextPageToken);
					}

					const response = await fetch(url.toString());

					if (!response.ok) {
						if (response.status === 403) {
							throw new Error('YouTube API quota exceeded or access denied');
						}
						throw new Error(`Failed to fetch chat messages: ${response.status}`);
					}

					const data: YouTubeLiveChatResponse = await response.json();

					pollingInterval = data.pollingIntervalMillis || 5000;
					nextPageToken = data.nextPageToken || null;

					for (const message of data.items) {
						const user = message.authorDetails.displayName;
						const text = message.snippet.displayMessage;

						if (user && text) {
							writeSse(controller, 'message', { user, text });
						}
					}
				} catch (error) {
					console.error('Error fetching chat messages:', error);
					writeSse(controller, 'error', {
						message: 'Failed to fetch chat messages',
						error: String(error)
					});
				}
			};

			const initializeConnection = async () => {
				try {
					writeSse(controller, 'system', { message: `Connecting to YouTube Live Chat for channel: ${channelId}` });

					liveChatId = await getLiveChatId();
					if (!liveChatId) {
						throw new Error('Could not find live chat for this channel');
					}

					connected = true;
					writeSse(controller, 'system', { message: `Connected to YouTube Live Chat` });

					const pollMessages = () => {
						if (connected) {
							fetchChatMessages();
							setTimeout(pollMessages, pollingInterval);
						}
					};

					keepAlive = setInterval(() => {
						controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
					}, 15000);

					pollMessages();
				} catch (error) {
					writeSse(controller, 'error', {
						message: 'YouTube connection error',
						error: String(error)
					});
					closeAll('youtube error');
				}
			};

			initializeConnection();

			req.signal.addEventListener('abort', () => {
				writeSse(controller, 'system', { message: 'Client disconnected' });
				closeAll('client aborted');
			});
		},
		cancel() {}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache, no-transform',
			connection: 'keep-alive',
			'x-accel-buffering': 'no'
		}
	});
}

// export const runtime = 'nodejs';
// export const dynamic = 'force-dynamic';
// export const revalidate = 0;

// import YouTube from 'youtube-live-chat';

// interface YouTubeMessageData {
// 	snippet: {
// 		displayMessage: string;
// 	};
// 	authorDetails?: {
// 		displayName: string;
// 	};
// }

// function writeSse(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
// 	const payload = typeof data === 'string' ? data : JSON.stringify(data);
// 	const sse = `event: ${event}\n` + `data: ${payload}\n\n`;
// 	controller.enqueue(new TextEncoder().encode(sse));
// }

// export async function GET(req: Request) {
// 	const { searchParams } = new URL(req.url);
// 	const channelId = searchParams.get('channel_id');
// 	if (!channelId) {
// 		return new Response(JSON.stringify({ error: 'Missing required query param: channel_id' }), {
// 			status: 400,
// 			headers: { 'content-type': 'application/json' }
// 		});
// 	}

// 	const apiKey = process.env.GCC_API_KEY;
// 	if (!apiKey) {
// 		return new Response(JSON.stringify({ error: 'YouTube API key not configured' }), {
// 			status: 500,
// 			headers: { 'content-type': 'application/json' }
// 		});
// 	}

// 	const stream = new ReadableStream<Uint8Array>({
// 		start(controller) {
// 			let keepAlive: ReturnType<typeof setInterval> | null = null;
// 			let connected = false;
// 			let yt: YouTube | null = null;

// 			const closeAll = (reason?: string) => {
// 				if (keepAlive) {
// 					clearInterval(keepAlive);
// 					keepAlive = null;
// 				}
// 				if (yt) {
// 					yt.stop();
// 					yt = null;
// 				}
// 				if (!connected) {
// 					controller.error(new Error(reason || 'Connection closed'));
// 				} else {
// 					controller.close();
// 				}
// 			};

// 			const initializeConnection = async () => {
// 				try {
// 					writeSse(controller, 'system', { message: `Connecting to YouTube Live Chat for channel: ${channelId}` });

// 					yt = new YouTube(channelId, apiKey);

// 					yt.on('ready', () => {
// 						console.log('YouTube Live Chat ready!');
// 						connected = true;
// 						writeSse(controller, 'system', { message: 'Connected to YouTube Live Chat' });

// 						yt!.listen(1000);
// 					});

// 					yt.on('message', (data: YouTubeMessageData) => {
// 						if (data.snippet && data.snippet.displayMessage) {
// 							const user = data.authorDetails?.displayName || 'Unknown';
// 							const text = data.snippet.displayMessage;
// 							writeSse(controller, 'message', { user, text });
// 						}
// 					});

// 					yt.on('error', (error: Error) => {
// 						console.error('YouTube Live Chat error:', error);
// 						writeSse(controller, 'error', {
// 							message: 'YouTube Live Chat error',
// 							error: String(error)
// 						});
// 						closeAll('youtube error');
// 					});

// 					keepAlive = setInterval(() => {
// 						controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
// 					}, 15000);
// 				} catch (error) {
// 					writeSse(controller, 'error', {
// 						message: 'YouTube connection error',
// 						error: String(error)
// 					});
// 					closeAll('youtube error');
// 				}
// 			};

// 			initializeConnection();

// 			req.signal.addEventListener('abort', () => {
// 				writeSse(controller, 'system', { message: 'Client disconnected' });
// 				closeAll('client aborted');
// 			});
// 		},
// 		cancel() {}
// 	});

// 	return new Response(stream, {
// 		headers: {
// 			'content-type': 'text/event-stream',
// 			'cache-control': 'no-cache, no-transform',
// 			connection: 'keep-alive',
// 			'x-accel-buffering': 'no'
// 		}
// 	});
// }
