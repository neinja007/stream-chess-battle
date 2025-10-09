import { Settings as SettingsType } from '@/types/settings';
import { useState } from 'react';
import { Chessboard } from './chessboard';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const [game, setGame] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

	return (
		<div className='w-full max-w-7xl mx-auto pt-24 flex flex-col gap-4'>
			<div className='max-w-lg rounded-xl overflow-hidden'>
				<Chessboard game={game} />
			</div>
		</div>
	);
};
