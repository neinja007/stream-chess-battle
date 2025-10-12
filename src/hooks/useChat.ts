import { processMove } from '@/lib/process-move';
import { FrontendTwitchConnection } from '@/lib/frontend-twitch-connection';
import { useState, useEffect, useCallback, useRef } from 'react';

type ChatStatus = 'active' | 'disconnected';

export type Move = {
	move: string;
	user: string;
	count: number;
};

export const useChat = ({
	enable,
	testAndTransformMove,
	info
}: {
	info: {
		platform: 'twitch' | 'youtube' | 'self';
		channel: string;
	};
	enable: boolean;
	testAndTransformMove: (move: string) => string | undefined;
}) => {
	const [moves, setMoves] = useState<Move[]>([]);
	const [status, setStatus] = useState<ChatStatus>('disconnected');
	const twitchConnectionRef = useRef<FrontendTwitchConnection | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	const clear = useCallback((move?: string) => {
		if (!move) {
			setMoves([]);
			return;
		}
		setMoves((prev) => prev.filter((m) => m.move !== move));
	}, []);

	useEffect(() => {
		if (!info.channel || info.platform === 'self') {
			setStatus('disconnected');
			return;
		}

		if (!enable) {
			if (twitchConnectionRef.current) {
				twitchConnectionRef.current.close();
				twitchConnectionRef.current = null;
			}
			setStatus('disconnected');
			return;
		}

		if (info.platform !== 'twitch') {
			const url = `/api/${info.platform}/chat${
				info.channel === 'simulate' ? '/simulate' : ''
			}?channel_id=${encodeURIComponent(info.channel)}`;
			eventSourceRef.current = new EventSource(url);

			setStatus('active');

			eventSourceRef.current.addEventListener('message', (event: MessageEvent<string>) => {
				try {
					processMove(testAndTransformMove, JSON.parse(event.data), setMoves);
				} catch (error) {
					console.error('Error parsing message:', error);
				}
			});

			eventSourceRef.current.addEventListener('system', (event) => {
				try {
					const data = JSON.parse(event.data);
					console.log('System message:', data.message);
				} catch (error) {
					console.error('Error parsing system message:', error);
				}
			});

			eventSourceRef.current.addEventListener('error', (event) => {
				console.error('EventSource error:', event);
				setStatus('disconnected');
			});

			eventSourceRef.current.onopen = () => {
				setStatus('active');
			};

			return () => {
				eventSourceRef.current?.close();
				setStatus('disconnected');
			};
		}

		if (twitchConnectionRef.current) {
			twitchConnectionRef.current.close();
			twitchConnectionRef.current = null;
		}

		const twitchConnection = new FrontendTwitchConnection({
			channel: info.channel,
			onMessage: (message) => {
				console.log('Twitch message:', message);
				processMove(testAndTransformMove, message, setMoves);
			},
			onError: (error) => {
				console.error('Twitch connection error:', error);
				setStatus('disconnected');
			},
			onSystemMessage: (message) => {
				console.log('Twitch system message:', message);
			},
			onConnect: () => {
				setStatus('active');
			},
			onDisconnect: () => {
				setStatus('disconnected');
			}
		});

		twitchConnectionRef.current = twitchConnection;
		twitchConnection.connect();

		return () => {
			if (twitchConnectionRef.current) {
				twitchConnectionRef.current.close();
				twitchConnectionRef.current = null;
			}
			setStatus('disconnected');
		};
	}, [info, enable, testAndTransformMove]);

	useEffect(() => {
		return () => {
			if (twitchConnectionRef.current) {
				twitchConnectionRef.current.close();
			}
		};
	}, []);

	return {
		moves,
		clear,
		status
	};
};
