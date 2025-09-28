import Image from 'next/image';

export default function Home() {
	return (
		<div className='p-20'>
			<div className='flex justify-between items-center'>
				<div className='text-3xl font-medium flex items-center'>
					<Image src='/twitch.png' alt='Twitch' width={60} height={60} />{' '}
					<span className='text-[#a544ff] mr-2'>Twitch</span> vs{' '}
					<Image src='/youtube.png' alt='YouTube' width={50} height={50} className='mx-2' />{' '}
					<span className='text-[#ff0100] mr-2'>YouTube</span>- hosted by Eric Rosen
				</div>
				<div className='text-3xl font-medium'>
					Live on <span className='text-[#a544ff]'>twitch.tv/imrosen</span> and{' '}
					<span className='text-[#ff0100]'>youtube.com/@eric-rosen</span>
				</div>
			</div>
		</div>
	);
}
