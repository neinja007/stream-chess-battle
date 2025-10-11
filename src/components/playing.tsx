import { PlayerInfo, GameSettings as SettingsType } from '@/types/settings';
import { Chessboard } from './chessboard';
import { Evaluation } from './evaluation';
import { useChat } from '@/hooks/useChat';
import { Chat } from './chat';
import { useChessGame } from '@/hooks/useChessGame';
import { testAndTransformMove } from '@/lib/test-transform-move';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { findMove } from '@/lib/find-move';
import { Clock, Cog, Dices, Pause, Play, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import Link from 'next/link';
import { moveSelectionMap } from '@/data/move-selection-map';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const { position, move, gameOver, reset, turn, legalMoves } = useChessGame();
	const [timeLeft, setTimeLeft] = useState(settings.secondsPerMove);
	const [paused, setPaused] = useState(true);

	const testAndTransformMoveFunction = useCallback((move: string) => testAndTransformMove(position, move), [position]);

	const activeTurnWhite = useMemo(() => turn === 'w', [turn]);

	const whiteChat = useChat({
		info: settings.playerWhite as PlayerInfo,
		activeTurn: activeTurnWhite,
		testAndTransformMove: testAndTransformMoveFunction
	});

	const blackChat = useChat({
		info: settings.playerBlack as PlayerInfo,
		activeTurn: !activeTurnWhite,
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
			<div className='flex flex-col items-center grow'>
				<div className='w-full text-lg flex items-end gap-2 justify-between'>
					<span className='font-bold text-2xl'>Stream Chess Battle</span>
					<span>
						by{' '}
						<Link href='https://neinja.dev' target='_blank' className='text-blue-500 underline'>
							neinja.dev
						</Link>
					</span>
				</div>
				<hr className='w-full border-t border-blue-500 my-4 mt-2' />
				<div className='text-left w-full mb-2 text-lg'>Game controls</div>
				<div className='grid grid-cols-2 gap-2 w-full'>
					<Button onClick={() => setPaused(!paused)}>
						{paused ? <Play /> : <Pause />} {paused ? 'Resume' : 'Pause'}
					</Button>
					<Button
						onClick={() => {
							reset();
							setPaused(true);
							setTimeLeft(settings.secondsPerMove);
							whiteChat.clear();
							blackChat.clear();
						}}
					>
						<RotateCcw /> Reset
					</Button>
				</div>
				<hr className='w-full border-t border-blue-500 my-4' />
				<div className='text-left w-full mb-2 text-lg'>Chat controls</div>
				<div className='grid grid-cols-2 gap-2 w-full'>
					<Button onClick={() => whiteChat.clear()}>
						<Trash2 /> Clear White Chat
					</Button>
					<Button onClick={() => blackChat.clear()}>
						<Trash2 /> Clear Black Chat
					</Button>
				</div>
				<hr className='w-full border-t border-blue-500 my-4' />
				<div className='text-left w-full mb-2 text-lg'>Game information</div>
				<div className='text-left w-full mb-2 flex items-center gap-1'>
					<Clock className='size-4' />
					Time per move: <span className='font-bold'>{settings.secondsPerMove} seconds</span>
				</div>
				<div className='text-left w-full mb-2 flex items-center gap-1'>
					<Dices className='size-4' />
					Move selection:{' '}
					<span className='font-bold'>{moveSelectionMap[settings.moveSelection as keyof typeof moveSelectionMap]}</span>
				</div>
				<div className='text-left w-full mb-2 flex items-center gap-1'>
					<Cog className='size-4' />
					Variant: <span className='font-bold'>Standard</span>
				</div>
			</div>
		</div>
	);
};
