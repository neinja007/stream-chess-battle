import { processMove } from '@/lib/process-move';
import { FrontendTwitchConnection } from '@/lib/frontend-twitch-connection';
import { FrontendYouTubeConnection } from '@/lib/frontend-youtube-connection';
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
	const connectionRef = useRef<FrontendTwitchConnection | FrontendYouTubeConnection | null>(null);

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
			if (connectionRef.current) {
				connectionRef.current.close();
				connectionRef.current = null;
			}
			setStatus('disconnected');
			return;
		}

		if (connectionRef.current) {
			connectionRef.current.close();
			connectionRef.current = null;
		}

		if (info.platform === 'youtube') {
			const yt = new FrontendYouTubeConnection({
				channel: info.channel,
				apiKey: process.env.NEXT_PUBLIC_GCC_API_KEY ?? '',
				onMessage: (message) => {
					processMove(testAndTransformMove, message, setMoves);
				},
				onError: (error) => {
					console.error('YouTube connection error:', error);
					setStatus('disconnected');
				},
				onSystemMessage: (message) => {
					console.log('YouTube system message:', message);
				},
				onConnect: () => setStatus('active'),
				onDisconnect: () => setStatus('disconnected')
			});

			connectionRef.current = yt;
			yt.connect();

			return () => {
				connectionRef.current?.close();
				connectionRef.current = null;
				setStatus('disconnected');
			};
		}

		const twitchConnection = new FrontendTwitchConnection({
			channel: info.channel,
			onMessage: (message) => {
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

		connectionRef.current = twitchConnection;
		twitchConnection.connect();

		return () => {
			if (connectionRef.current) {
				connectionRef.current.close();
				connectionRef.current = null;
			}
			setStatus('disconnected');
		};
	}, [info, enable, testAndTransformMove]);

	useEffect(() => {
		return () => {
			if (connectionRef.current) {
				connectionRef.current.close();
			}
		};
	}, []);

	return {
		moves,
		clear,
		status
	};
};
