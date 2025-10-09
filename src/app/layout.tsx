import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import { BackgroundBeams } from '@/components/ui/background-beams';

const roboto = Roboto({
	subsets: ['latin'],
	variable: '--font-roboto'
});

export const metadata: Metadata = {
	title: 'Twitch vs YouTube',
	description: 'IMRosen Twitch vs YouTube Chess'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${roboto.variable} font-roboto antialiased h-full min-h-screen dark`}>
				<main className='z-10'>{children}</main>
				<BackgroundBeams />
			</body>
		</html>
	);
}
