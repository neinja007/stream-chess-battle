import { processMove } from '@/lib/process-move';
import { FrontendTwitchConnection, FrontendTwitchConnectionOptions } from '@/lib/frontend-twitch-connection';
import { FrontendYouTubeConnection, FrontendYouTubeConnectionOptions } from '@/lib/frontend-youtube-connection';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { VoteRestriction } from '@/types/settings';

type ChatStatus = 'active' | 'disconnected';

export type Move = {
	move: string;
	user: string;
	count: number;
};

export const useChat = ({
	enable,
	testAndTransformMove,
	info,
	voteRestriction
}: {
	info: {
		platform: 'twitch' | 'youtube' | 'self';
		channel: string;
	};
	enable: boolean;
	testAndTransformMove: (move: string) => string | undefined;
	voteRestriction: VoteRestriction;
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

	const connectionHandler: FrontendYouTubeConnectionOptions | FrontendTwitchConnectionOptions = useMemo(
		() => ({
			channel: info.channel,
			onMessage: (message) => {
				if (voteRestriction === '1VotePerUser' && moves.some((m) => m.user === message.user)) {
					return;
				} else if (
					voteRestriction === 'uniqueVotesPerUser' &&
					moves.some(
						(m) => testAndTransformMove(m.move) === testAndTransformMove(message.text) && m.user === message.user
					)
				) {
					return;
				}
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
		}),
		[info.channel, moves, testAndTransformMove, voteRestriction]
	);

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

		let connection: FrontendTwitchConnection | FrontendYouTubeConnection | null = null;

		if (info.platform === 'youtube') {
			connection = new FrontendYouTubeConnection(connectionHandler as FrontendYouTubeConnectionOptions);

			connectionRef.current = connection;
			connection.connect();
		}

		connection = new FrontendTwitchConnection(connectionHandler as FrontendTwitchConnectionOptions);

		connection.connect();

		return () => {
			if (connectionRef.current) {
				connectionRef.current.close();
				connectionRef.current = null;
			}
			setStatus('disconnected');
		};
	}, [info, enable, testAndTransformMove, voteRestriction, connectionHandler]);

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
