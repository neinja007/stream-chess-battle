import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types/message';

type ChatStatus = 'active' | 'disconnected';

export const useChat = ({ type, channelId }: { type: 'twitch' | 'youtube'; channelId: string }) => {
	const [moves, setMoves] = useState<Message[]>([]);
	const [status, setStatus] = useState<ChatStatus>('disconnected');
	const eventSourceRef = useRef<EventSource | null>(null);

	const clear = useCallback((move: string) => {
		setMoves((prev) => prev.filter((m) => m.text !== move));
	}, []);

	useEffect(() => {
		if (!channelId) {
			setStatus('disconnected');
			return;
		}

		if (eventSourceRef.current) {
			eventSourceRef.current.close();
			eventSourceRef.current = null;
		}

		const url = `/api/${type.replace('youtube', 'youtube/simulate')}/chat?channel_id=${encodeURIComponent(channelId)}`;
		const eventSource = new EventSource(url);
		eventSourceRef.current = eventSource;

		setStatus('active');

		eventSource.addEventListener('message', (event) => {
			try {
				const data = JSON.parse(event.data);
				const message: Message = {
					platform: type,
					user: data.user || 'unknown',
					text: data.text || ''
				};
				setMoves((prev) => [...prev, message]);
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

		// Handle connection open
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
	}, [type, channelId]);

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
