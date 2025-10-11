import { Move } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { PlayerInfo } from '@/types/settings';
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons';

type ChatProps = {
	moves: Move[];
	activeTurn: boolean;
	info: PlayerInfo;
	color: 'white' | 'black';
};

export const Chat = ({ moves, info, color }: ChatProps) => {
	return (
		<div className='flex flex-col gap-4 h-full overflow-hidden'>
			<h1 className='text-lg font-semibold shrink-0 flex items-center justify-between gap-2'>
				<div className={cn('flex items-center gap-2', info.platform === 'twitch' ? 'text-purple-500' : 'text-red-500')}>
					{info.platform === 'twitch' ? <SiTwitch /> : <SiYoutube />} {info.channel}
				</div>
				<div
					className={cn(
						'flex items-center gap-2 border border-white rounded-md py-0.5 uppercase text-sm px-2',
						color === 'white' ? 'text-black bg-white' : 'text-white bg-black'
					)}
				>
					{color}
				</div>
			</h1>
			<div className='flex flex-col gap-2 overflow-y-auto flex-1 scroll-smooth'>
				{moves
					.sort((a, b) => b.count - a.count)
					.slice(0, 5)
					.map((move) => (
						<div key={move.move} className='text-sm flex items-center justify-between gap-2'>
							{move.move} <span className='text-muted-foreground'>{move.count}</span>
						</div>
					))}
			</div>
		</div>
	);
};
