import type { Metadata } from 'next';
import './globals.css';
import { Roboto } from 'next/font/google';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { TanstackQueryProvider } from '@/components/tanstack-query-provider';
import { Analytics } from '@vercel/analytics/next';

const roboto = Roboto({
	subsets: ['latin'],
	variable: '--font-roboto'
});

export const metadata: Metadata = {
	title: 'Stream Chess Battle',
	description: 'Stream Chess Battle'
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={`${roboto.variable} font-roboto antialiased h-full min-h-screen dark`}>
				<TanstackQueryProvider>
					<main className='z-10'>{children}</main>
				</TanstackQueryProvider>
				<BackgroundBeams />
				<Analytics />
			</body>
		</html>
	);
}
