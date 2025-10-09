import WebSocket from 'ws';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function writeSse(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
	const payload = typeof data === 'string' ? data : JSON.stringify(data);
	const sse = `event: ${event}\n` + `data: ${payload}\n\n`;
	controller.enqueue(new TextEncoder().encode(sse));
}

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const channel = searchParams.get('channel_id');
	if (!channel) {
		return new Response(JSON.stringify({ error: 'Missing required query param: channel_id' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			// Set up Twitch IRC connection (over WebSocket to TMI)
			const tmiUrl = 'wss://irc-ws.chat.twitch.tv:443';
			const ws = new WebSocket(tmiUrl);

			let keepAlive: ReturnType<typeof setInterval> | null = null;
			let connected = false;

			const closeAll = (reason?: string) => {
				if (keepAlive) {
					clearInterval(keepAlive);
					keepAlive = null;
				}
				try {
					ws.close();
				} catch {}
				if (!connected) {
					controller.error(new Error(reason || 'Connection closed'));
				} else {
					controller.close();
				}
			};

			ws.on('open', () => {
				connected = true;
				const username = 'justinfan' + Math.floor(Math.random() * 100000);
				// Anonymous login
				ws.send('PASS SCHMOOPIIE');
				ws.send(`NICK ${username}`);
				ws.send(`JOIN #${channel}`);

				writeSse(controller, 'system', { message: `Joined #${channel} as ${username}` });

				// Keep the SSE alive for proxies
				keepAlive = setInterval(() => {
					controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
				}, 15000);
			});

			ws.on('message', (data: WebSocket.RawData) => {
				const message = data.toString();
				if (message.startsWith('PING')) {
					ws.send('PONG :tmi.twitch.tv');
					return;
				}
				const isPRIVMSG = message.includes('PRIVMSG');
				if (isPRIVMSG) {
					const user = message.split('!')[0].split(':').at(-1);
					const text = message.split('PRIVMSG #' + channel + ' :').at(1);
					if (!user || !text) return;
					writeSse(controller, 'message', { user, text });
					return;
				}
			});

			ws.on('error', (err: unknown) => {
				writeSse(controller, 'error', { message: 'Twitch IRC error', error: String(err) });
				closeAll('twitch error');
			});

			ws.on('close', () => {
				writeSse(controller, 'system', { message: 'Disconnected from Twitch IRC' });
				closeAll('twitch closed');
			});

			// Handle client disconnect
			req.signal.addEventListener('abort', () => {
				writeSse(controller, 'system', { message: 'Client disconnected' });
				closeAll('client aborted');
			});
		},
		cancel() {
			// No-op; handled in closeAll
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache, no-transform',
			connection: 'keep-alive',
			// Allow the browser to receive events immediately
			'x-accel-buffering': 'no'
		}
	});
}
