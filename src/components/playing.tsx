import { PlayerInfo, GameSettings as SettingsType } from '@/types/settings';
import { Chessboard } from './chessboard';
import { Evaluation } from './evaluation';
import { useChat } from '@/hooks/useChat';
import { Chat } from './chat';
import { useChessGame } from '@/hooks/useChessGame';
import { testAndTransformMove } from '@/lib/test-transform-move';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	const { position, move, gameOver, reset, turn } = useChessGame();

	const whiteChat = useChat({
		info: settings.playerWhite as PlayerInfo,
		activeTurn: turn === 'w',
		testAndTransformMove: (move: string) => testAndTransformMove(position, move)
	});

	const blackChat = useChat({
		info: settings.playerBlack as PlayerInfo,
		activeTurn: turn === 'b',
		testAndTransformMove: (move: string) => testAndTransformMove(position, move)
	});

	return (
		<div className='w-full max-w-7xl mx-auto pt-24 flex gap-5'>
			<div className='flex items-center gap-4 shrink-0'>
				{settings.evaluationBar === 'show' && <Evaluation game={position} />}
				<div className='max-w-xl rounded-xl overflow-hidden'>
					<Chessboard game={position} />
				</div>
			</div>
			<div className='grid grid-rows-2 gap-4 h-[640px] w-56'>
				<Chat
					activeTurn={turn === 'w'}
					moves={whiteChat.moves}
					color='white'
					info={settings.playerWhite as PlayerInfo}
					clearMove={whiteChat.clear}
				/>
				<Chat
					activeTurn={turn === 'b'}
					moves={blackChat.moves}
					color='black'
					info={settings.playerBlack as PlayerInfo}
					clearMove={blackChat.clear}
				/>
			</div>
		</div>
	);
};
