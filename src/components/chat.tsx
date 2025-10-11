import { Move } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { PlayerInfo } from '@/types/settings';
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons';
import { X } from 'lucide-react';

type ChatProps = {
	moves: Move[];
	activeTurn: boolean;
	info: PlayerInfo;
	color: 'white' | 'black';
	clearMove: (move: string) => void;
	timeLeft: number;
	defaultTimeLeft: number;
};

export const Chat = ({ moves, info, color, clearMove, activeTurn, timeLeft, defaultTimeLeft }: ChatProps) => {
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
				{activeTurn ? (
					moves
						.sort((a, b) => b.count - a.count)
						.slice(0, 5)
						.map((move) => (
							<div key={move.move} className='group text-sm flex items-center justify-between gap-2'>
								<span>{move.move}</span>
								<div>
									<span className='visible group-hover:hidden text-muted-foreground'>{move.count}</span>
									<button className='hidden group-hover:block' onClick={() => clearMove(move.move)}>
										<X className='size-4' />
									</button>
								</div>
							</div>
						))
				) : (
					<div className='text-center text-muted-foreground'>Await your turn...</div>
				)}
			</div>
			<div className='flex justify-between'>
				<span>{moves.reduce((acc, move) => acc + move.count, 0)} Votes</span>
				<div className={cn('rounded-md text-black px-2 py-0.5', activeTurn ? 'bg-white' : 'bg-gray-500')}>
					{activeTurn ? timeLeft.toFixed(2) : defaultTimeLeft.toFixed(2)}
				</div>
			</div>
		</div>
	);
};
