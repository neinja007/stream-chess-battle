import { Settings as SettingsType } from '@/types/settings';
import { useState } from 'react';
import { Chessboard } from './chessboard';
import { Evaluation } from './evaluation';
import { defaultFen } from '@/data/chess';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const [game, setGame] = useState<string>(defaultFen);

	return (
		<div className='w-full max-w-7xl mx-auto pt-24 flex flex-col gap-4'>
			<div className='flex items-center gap-4'>
				{settings.evaluationBar === 'show' && <Evaluation game={game} />}
				<div className='max-w-xl rounded-xl overflow-hidden'>
					<Chessboard game={game} />
				</div>
			</div>
		</div>
	);
};
