import { cn } from '@/lib/utils';
import { Message } from '@/types/message';
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons';

type ChatProps = {
	messages: Message[];
	channelId: string;
	platform: 'twitch' | 'youtube';
	color: 'white' | 'black';
};

export const Chat = ({ messages, channelId, platform, color }: ChatProps) => {
	return (
		<div className='flex flex-col gap-4 h-full overflow-hidden'>
			<h1 className='text-lg font-semibold shrink-0 flex items-center justify-between gap-2'>
				<div className={cn('flex items-center gap-2', platform === 'twitch' ? 'text-purple-500' : 'text-red-500')}>
					{platform === 'twitch' ? <SiTwitch /> : <SiYoutube />} {channelId}
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
				{messages.map((message) => (
					<div key={message.text} className='text-sm'>
						{message.text}
					</div>
				))}
			</div>
		</div>
	);
};
