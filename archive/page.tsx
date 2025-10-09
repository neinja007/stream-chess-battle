'use client';

import { Heading } from '@/components/heading';
import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import Image from 'next/image';
import { Settings } from '@/types/settings';
import { defaultSettings } from '@/data/default-settings';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [settings, setSettings] = useState<Settings>(defaultSettings);

	const [game] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

	return (
		<div className='py-5 px-20 text-xl'>
			<Heading />
			{status === 'settings' && (
				<div className='w-full max-w-xl mx-auto mt-5 rounded-lg p-5'>
					<div className='flex justify-between items-center'>
						<div className='font-bold'>Game Settings</div>
						<button
							className='text-white rounded-md py-1 px-2 bg-blue-500 hover:bg-blue-600 cursor-pointer'
							onClick={() => setStatus('playing')}
						>
							Start Game
						</button>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Move Selection</div>
						<select
							className='rounded-md p-2'
							value={moveSelection}
							onChange={(e) => setMoveSelection(e.target.value as 'mostVotes' | 'weightedRandom' | 'random')}
						>
							<option value='mostVotes'>Most Votes</option>
							<option value='weightedRandom'>Weighted Random</option>
							<option value='random'>Random</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Who plays White?</div>
						<select
							className='rounded-md p-2'
							value={whoPlaysWhite}
							onChange={(e) => setWhoPlaysWhite(e.target.value as 'twitch' | 'youtube')}
						>
							<option value='twitch'>Twitch</option>
							<option value='youtube'>YouTube</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Pay to Win?</div>
						<select className='rounded-md p-2'>
							<option value='twitch'>1$ = 1 Point of Material</option>
							<option value='youtube'>Free to Play</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Time per Move</div>
						<select
							className='rounded-md p-2'
							value={timePerMove}
							onChange={(e) => setTimePerMove(Number(e.target.value))}
						>
							<option value='10'>10s</option>
							<option value='15'>15s</option>
							<option value='30'>30s</option>
							<option value='60'>60s</option>
						</select>
					</div>
					<hr className='my-3 border-blue-500' />
					<div className='flex justify-between items-center'>
						<div>Evaluation Bar</div>
						<select
							className='rounded-md p-2'
							value={evaluationBar}
							onChange={(e) => setEvaluationBar(e.target.value as 'show' | 'hide')}
						>
							<option value='show'>Show</option>
							<option value='hide'>Hide</option>
						</select>
					</div>
				</div>
			)}
			{status === 'playing' && (
				<div className='w-full flex gap-5 mt-10'>
					<div className='w-[700px]'>
						<Chessboard
							options={{
								position: game,
								animationDurationInMs: 1000,
								boardOrientation: 'white',
								allowDragging: false,
								numericNotationStyle: {
									fontSize: '16px',
									fontWeight: 'bold'
								},
								alphaNotationStyle: {
									fontSize: '16px',
									fontWeight: 'bold'
								},
								showNotation: true,
								showAnimations: true,
								allowDrawingArrows: false,
								squareRenderer: ({ piece, children }) => {
									if (piece) {
										const isTwitchPiece =
											(piece.pieceType.startsWith('w') ? 1 : 0) ^ (whoPlaysWhite === 'twitch' ? 1 : 0);
										return (
											<div
												style={{
													position: 'relative',
													width: '100%',
													height: '100%',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center'
												}}
											>
												{children}
												<Image
													src={isTwitchPiece ? '/twitch.png' : '/youtube.png'}
													alt={isTwitchPiece ? 'Twitch' : 'YouTube'}
													width={isTwitchPiece ? 30 : 25}
													height={isTwitchPiece ? 30 : 25}
													style={{
														position: 'absolute',
														bottom: '10%',
														right: isTwitchPiece ? '5%' : '10%',
														opacity: 1,
														pointerEvents: 'none',
														zIndex: 5
													}}
												/>
											</div>
										);
									}
									return <>{children}</>;
								}
							}}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
