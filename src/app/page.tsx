'use client';

import { Heading } from '@/components/heading';
import { useState } from 'react';

export default function Home() {
	const [status, setStatus] = useState<'idle' | 'playing'>('idle');
	return (
		<div className='p-20 text-xl'>
			<Heading />
			{status === 'idle' && (
				<div className='w-full max-w-xl mx-auto mt-5 rounded-lg p-5'>
					<div className='flex justify-between items-center'>
						<div className='font-bold'>Game Settings</div>
						<button
							className='text-white rounded-md py-1 px-2 bg-black/20 hover:bg-black/50 cursor-pointer'
							onClick={() => setStatus('playing')}
						>
							Start Game
						</button>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Move Selection</div>
						<select className='text-white rounded-md p-2'>
							<option className='bg-gray-800' value='white'>
								Most Votes
							</option>
							<option className='bg-gray-800' value='weightedRandom'>
								Weighted Random
							</option>
							<option className='bg-gray-800' value='random'>
								Random
							</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Who plays White?</div>
						<select className='text-white rounded-md p-2'>
							<option className='bg-gray-800' value='twitch'>
								Twitch
							</option>
							<option className='bg-gray-800' value='youtube'>
								YouTube
							</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Time per Move</div>
						<select className='text-white rounded-md p-2'>
							<option className='bg-gray-800' value='10'>
								10s
							</option>
							<option className='bg-gray-800' value='15'>
								15s
							</option>
							<option className='bg-gray-800' value='30'>
								30s
							</option>
							<option className='bg-gray-800' value='60'>
								60s
							</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Evaluation Bar</div>
						<select className='text-white rounded-md p-2'>
							<option className='bg-gray-800' value='show'>
								Show
							</option>
							<option className='bg-gray-800' value='hide'>
								Hide
							</option>
						</select>
					</div>
				</div>
			)}
			{status === 'playing' && <div className='text-3xl font-medium'>Playing...</div>}
		</div>
	);
}
