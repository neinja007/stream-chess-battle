import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';

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
			<body className={`${roboto.variable} font-roboto antialiased text-black h-full min-h-screen`}>{children}</body>
		</html>
	);
}
