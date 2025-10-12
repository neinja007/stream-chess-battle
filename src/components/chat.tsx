import { Move } from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { PlayerInfo } from '@/types/settings';
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons';
import { Ban } from 'lucide-react';

type ChatProps = {
	moves: Move[];
	activeTurn: boolean;
	info: PlayerInfo;
	color: 'white' | 'black';
	clearMove: (move: string) => void;
	timeLeft: number;
	defaultTimeLeft: number;
	result: 'white' | 'black' | 'draw' | undefined;
};

export const Chat = ({ moves, info, color, clearMove, activeTurn, timeLeft, defaultTimeLeft, result }: ChatProps) => {
	const totalCount = moves.reduce((acc, move) => acc + move.count, 0);

	return (
		<div
			className={cn(
				'flex flex-col gap-4 h-full overflow-hidden border p-1 rounded-xl px-2 transition-all',
				activeTurn ? 'border-blue-500 shadow-lg shadow-blue-500/50' : 'border-slate-800'
			)}
		>
			<h1 className='text-lg font-semibold shrink-0 flex items-center gap-2 min-w-0'>
				<div
					className={cn(
						'flex items-center gap-2 min-w-0 flex-1',
						info.platform === 'twitch' ? 'text-purple-500' : 'text-red-500'
					)}
				>
					{info.platform === 'twitch' ? <SiTwitch className='shrink-0' /> : <SiYoutube className='shrink-0' />}
					<span className='truncate min-w-0'>{info.channel}</span>
				</div>
				<div
					className={cn(
						'flex items-center gap-2 shrink-0 border border-white rounded-md py-0.5 uppercase text-sm px-2',
						color === 'white' ? 'text-black bg-white' : 'text-white bg-black'
					)}
				>
					{color.charAt(0).toUpperCase()}
				</div>
			</h1>
			<div className='flex flex-col gap-2 overflow-y-auto flex-1 scroll-smooth'>
				{!result ? (
					activeTurn ? (
						moves.length > 0 ? (
							moves
								.sort((a, b) => b.count - a.count)
								.slice(0, 5)
								.map((move, i) => (
									<button
										key={move.move}
										className='relative group text-sm flex items-center justify-between gap-2 px-1'
										onClick={() => clearMove(move.move)}
									>
										<div
											className={cn(
												'absolute left-0 top-0 h-full rounded z-0 transition-all',
												i === 0 ? 'bg-red-700/90' : 'bg-yellow-300/75'
											)}
											style={{
												width: `${(move.count / totalCount) * 100 || 0}%`
											}}
										/>
										<span className='relative z-10'>{move.move}</span>
										<div className='relative z-10'>
											<span className='visible group-hover:hidden text-muted-foreground'>
												{move.count} ({((move.count / totalCount) * 100).toFixed(1)}%)
											</span>
											<span className='hidden group-hover:flex text-red-500 items-center gap-1'>
												Ban move <Ban className='size-4' />
											</span>
										</div>
									</button>
								))
						) : (
							<div className='text-center'>Start voting!</div>
						)
					) : (
						<div className='text-center text-muted-foreground'>Await your turn!</div>
					)
				) : (
					<div className='text-center font-bold'>
						{result === color ? (
							<span className='text-green-500'>{info.channel}, you won!</span>
						) : result === 'draw' ? (
							<span className='text-yellow-500'>{info.channel}, you drew!</span>
						) : (
							<span className='text-red-500'>{info.channel}, you lost!</span>
						)}
					</div>
				)}
			</div>
			<div className='flex justify-between'>
				<span>{moves.reduce((acc, move) => acc + move.count, 0)} Votes</span>
				<div
					className={cn('rounded-md text-black px-2 py-0.5 transition-all', activeTurn ? 'bg-white' : 'bg-gray-500')}
				>
					{activeTurn ? timeLeft.toFixed(2) : defaultTimeLeft.toFixed(2)}
				</div>
			</div>
		</div>
	);
};
