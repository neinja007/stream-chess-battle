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
			let keepAlive: ReturnType<typeof setInterval> | null = null;
			let connected = false;

			let closeAll = (reason?: string) => {
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

			// Simulate YouTube connection
			setTimeout(() => {
				connected = true;
				writeSse(controller, 'system', { message: `Connected to YouTube Live Chat for channel: ${channel}` });

				// Keep the SSE alive for proxies
				keepAlive = setInterval(() => {
					controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
				}, 15000);

				// Simulate receiving chat messages (for testing purposes)
				// In a real implementation, this would connect to YouTube's Live Chat API
				const simulateMessage = () => {
					const users = ['ChessFan123', 'PlayerOne', 'GameMaster', 'ChessLover', 'StreamViewer'];
					const messages = [
						'e4',
						'e5',
						'Nf3',
						'Nc6',
						'Bb5',
						'a6',
						'Ba4',
						'Nf6',
						'O-O',
						'Be7',
						'Re1',
						'b5',
						'Bb3',
						'd6',
						'c3',
						'O-O',
						'h3',
						'Nb8',
						'd4',
						'Nbd7',
						'g3',
						'g6'
					];

					const user = users[Math.floor(Math.random() * users.length)];
					const text = messages[Math.floor(Math.random() * messages.length)];

					writeSse(controller, 'message', { user, text });
				};

				// Send a message every 2-5 seconds
				const messageInterval = setInterval(() => {
					if (connected) {
						simulateMessage();
					}
				}, Math.random() * 200);

				// Clean up message interval
				const originalCloseAll = closeAll;
				closeAll = (reason?: string) => {
					clearInterval(messageInterval);
					originalCloseAll(reason);
				};
			}, 1000);

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
