import { GameSettings as SettingsType } from '@/types/settings';
import { useState } from 'react';
import { Chessboard } from './chessboard';
import { Evaluation } from './evaluation';
import { defaultFen } from '@/data/chess';
import { useChat } from '@/hooks/useChat';
import { Chat } from './chat';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const [game, setGame] = useState<string>(defaultFen);

	const whiteChat = useChat({
		type: settings.playerWhite.platform!,
		channelId: settings.playerWhite.channel!
	});

	const blackChat = useChat({
		type: settings.playerBlack.platform!,
		channelId: settings.playerBlack.channel!
	});

	return (
		<div className='w-full max-w-7xl mx-auto pt-24 flex gap-4'>
			<div className='flex items-center gap-4 shrink-0'>
				{settings.evaluationBar === 'show' && <Evaluation game={game} />}
				<div className='max-w-xl rounded-xl overflow-hidden'>
					<Chessboard game={game} />
				</div>
			</div>
			<div className='grid grid-rows-2 gap-4 h-[640px]'>
				<Chat
					messages={whiteChat.moves}
					platform={settings.playerWhite.platform!}
					color='white'
					channelId={settings.playerWhite.channel!}
				/>
				<Chat
					messages={blackChat.moves}
					platform={settings.playerBlack.platform!}
					color='black'
					channelId={settings.playerBlack.channel!}
				/>
			</div>
		</div>
	);
};
