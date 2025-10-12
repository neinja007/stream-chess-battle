/**
 * Server-Sent Events utility functions
 */

export function writeSse(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
	try {
		const payload = typeof data === 'string' ? data : JSON.stringify(data);
		const sse = `event: ${event}\n` + `data: ${payload}\n\n`;
		controller.enqueue(new TextEncoder().encode(sse));
	} catch (error) {
		// Controller is likely closed, ignore the error
		console.warn('Failed to write SSE message - controller may be closed:', error);
	}
}

export function createSseResponse(stream: ReadableStream<Uint8Array>) {
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

export function createErrorResponse(message: string, status: number = 400) {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

export function createKeepAliveInterval(controller: ReadableStreamDefaultController<Uint8Array>) {
	return setInterval(() => {
		controller.enqueue(new TextEncoder().encode(': keep-alive\n\n'));
	}, 15000);
}
