import { createSseResponse, createErrorResponse } from '@/lib/sse-utils';
import { TwitchConnection } from '@/lib/twitch-connection';
import { ConnectionManager } from '@/lib/connection-manager';
import { writeSse } from '@/lib/sse-utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const channel = searchParams.get('channel_id');

	if (!channel) {
		return createErrorResponse('Missing required query param: channel_id', 400);
	}

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			const connectionManager = new ConnectionManager({
				controller,
				onClientAbort: () => {
					twitchConnection.close('client aborted');
				}
			});

			const twitchConnection = new TwitchConnection({
				channel,
				controller,
				onMessage: (message) => {
					if (!connectionManager.isConnected()) return;
					writeSse(controller, 'message', message);
				},
				onError: (error) => {
					connectionManager.sendErrorMessage('Twitch IRC error', error);
					connectionManager.close('twitch error');
				},
				onSystemMessage: (message) => {
					connectionManager.sendSystemMessage(message);
				}
			});

			// Connect to Twitch
			twitchConnection.connect();
			connectionManager.setConnected(true);

			// Setup client abort handler
			connectionManager.setupClientAbortHandler(req);
		},
		cancel() {
			// Cleanup is handled by the connection manager
		}
	});

	return createSseResponse(stream);
}
