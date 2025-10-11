import { PlayerInfo, GameSettings as SettingsType } from '@/types/settings';
import { Chessboard } from './chessboard';
import { Evaluation } from './evaluation';
import { useChat } from '@/hooks/useChat';
import { Chat } from './chat';
import { useChessGame } from '@/hooks/useChessGame';
import { testAndTransformMove } from '@/lib/test-transform-move';
import { useEffect, useState, useCallback } from 'react';
import { findMove } from '@/lib/find-move';
import { Pause, Play } from 'lucide-react';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const { position, move, gameOver, reset, turn, legalMoves } = useChessGame();
	const [timeLeft, setTimeLeft] = useState(settings.secondsPerMove);
	const [paused, setPaused] = useState(true);

	const testAndTransformMoveFunction = useCallback((move: string) => testAndTransformMove(position, move), [position]);

	const whiteChat = useChat({
		info: settings.playerWhite as PlayerInfo,
		activeTurn: turn === 'w',
		testAndTransformMove: testAndTransformMoveFunction
	});

	const blackChat = useChat({
		info: settings.playerBlack as PlayerInfo,
		activeTurn: turn === 'b',
		testAndTransformMove: testAndTransformMoveFunction
	});

	const executeMove = useCallback(() => {
		const foundMove = findMove(turn === 'w' ? whiteChat.moves : blackChat.moves, settings.moveSelection!, legalMoves);
		move(foundMove);
	}, [move, turn, whiteChat.moves, blackChat.moves, settings.moveSelection, legalMoves]);

	useEffect(() => {
		if (paused) return;
		const interval = setInterval(() => {
			setTimeLeft((prev) => prev - 0.1);
		}, 100);
		return () => clearInterval(interval);
	}, [paused, settings.secondsPerMove]);

	useEffect(() => {
		if (timeLeft <= 0) {
			setTimeLeft(settings.secondsPerMove);
			executeMove();
			whiteChat.clear();
			blackChat.clear();
		}
	}, [blackChat, executeMove, settings.secondsPerMove, timeLeft, whiteChat]);

	return (
		<div className='w-full max-w-7xl mx-auto pt-24 flex gap-5'>
			<div className='flex items-center gap-4 shrink-0'>
				{settings.evaluationBar === 'show' && <Evaluation game={position} />}
				<div className='max-w-xl rounded-xl overflow-hidden'>
					<Chessboard game={position} moves={turn === 'w' ? whiteChat.moves : blackChat.moves} />
				</div>
			</div>
			<div className='grid grid-rows-2 gap-4 h-[640px] w-56'>
				<Chat
					activeTurn={turn === 'w'}
					moves={whiteChat.moves}
					color='white'
					info={settings.playerWhite as PlayerInfo}
					clearMove={whiteChat.clear}
					timeLeft={timeLeft}
					defaultTimeLeft={settings.secondsPerMove}
				/>
				<Chat
					activeTurn={turn === 'b'}
					moves={blackChat.moves}
					color='black'
					info={settings.playerBlack as PlayerInfo}
					clearMove={blackChat.clear}
					timeLeft={timeLeft}
					defaultTimeLeft={settings.secondsPerMove}
				/>
			</div>
			<div>
				<button onClick={() => setPaused(!paused)} className='bg-white text-black rounded-md p-2'>
					{paused ? <Play /> : <Pause />}
				</button>
			</div>
		</div>
	);
};
