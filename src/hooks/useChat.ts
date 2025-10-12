import { processMove } from '@/lib/process-move';
import { useState, useEffect, useCallback, useRef } from 'react';

type ChatStatus = 'active' | 'disconnected';

export type Move = {
	move: string;
	user: string;
	count: number;
};

export const useChat = ({
	activeTurn,
	testAndTransformMove,
	info
}: {
	info: {
		platform: 'twitch' | 'youtube';
		channel: string;
	};
	activeTurn: boolean;
	testAndTransformMove: (move: string) => string | undefined;
}) => {
	const [moves, setMoves] = useState<Move[]>([]);
	const [status, setStatus] = useState<ChatStatus>('disconnected');
	const eventSourceRef = useRef<EventSource | null>(null);

	const clear = useCallback((move?: string) => {
		if (!move) {
			setMoves([]);
			return;
		}
		setMoves((prev) => prev.filter((m) => m.move !== move));
	}, []);

	useEffect(() => {
		if (!info.channel) {
			setStatus('disconnected');
			return;
		}

		if (!activeTurn) {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
			setStatus('disconnected');
			return;
		}

		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}

		const url = `/api/${info.platform}/chat${
			info.channel === 'simulate' ? '/simulate' : ''
		}?channel_id=${encodeURIComponent(info.channel)}`;
		const eventSource = new EventSource(url);
		eventSourceRef.current = eventSource;

		setStatus('active');

		eventSource.addEventListener('message', (event: MessageEvent<string>) => {
			try {
				// Only process moves when it's our turn (we're already connected only when it's our turn)
				processMove(testAndTransformMove, JSON.parse(event.data), setMoves);
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		});

		eventSource.addEventListener('system', (event) => {
			try {
				const data = JSON.parse(event.data);
				console.log('System message:', data.message);
			} catch (error) {
				console.error('Error parsing system message:', error);
			}
		});

		eventSource.addEventListener('error', (event) => {
			console.error('EventSource error:', event);
			setStatus('disconnected');
		});

		eventSource.onopen = () => {
			setStatus('active');
		};

		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
				eventSourceRef.current = null;
			}
			setStatus('disconnected');
		};
	}, [info, activeTurn, testAndTransformMove]);

	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close();
			}
		};
	}, []);

	return {
		moves,
		clear,
		status
	};
};
