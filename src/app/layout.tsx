import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import './globals.css';

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
			<body className='font-sans antialiased bg-gradient-to-br from-purple-950 to-pink-950 h-full min-h-screen'>
				{children}
			</body>
		</html>
	);
}
