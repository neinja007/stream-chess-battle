import { Move } from '@/hooks/useChat';
import { testAndTransformMove } from '@/lib/test-transform-move';
import { Chess } from 'chess.js';
import { Arrow, Chessboard as ChessboardComponent } from 'react-chessboard';

type ChessboardProps = {
	game: string;
	moves: Move[];
	orientation: 'white' | 'black';
	onMove?: (move: string) => void;
};

export const Chessboard = ({ game, moves, orientation, onMove }: ChessboardProps) => {
	const arrows = moves
		.sort((a, b) => b.count - a.count)
		.slice(0, 5)
		.reduce((acc, move, i) => {
			try {
				const chess = new Chess(game);

				const result = chess.move(move.move, { strict: false });
				if (!result) return acc;

				return [
					...acc,
					{
						startSquare: result.from,
						endSquare: result.to,
						color: i === 0 ? '#ff0000' : '#ffff00'
					} as Arrow
				];
			} catch {
				return acc;
			}
		}, [] as Arrow[])
		.reverse();

	return (
		<ChessboardComponent
			options={{
				position: game,
				animationDurationInMs: 1000,
				boardOrientation: orientation,
				allowDragging: !!onMove,
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
				darkSquareStyle: {
					backgroundColor: 'oklch(39.8% 0.195 277.366)'
				},
				lightSquareStyle: {
					backgroundColor: 'oklch(74.6% 0.16 232.661)'
				},
				arrows,
				allowDrawingArrows: process.env.NEXT_PUBLIC_ENABLE_DEVTOOLS === 'true' ? true : false,
				onPieceDrop: onMove
					? ({ sourceSquare, targetSquare }) => {
							const move = testAndTransformMove(game, `${sourceSquare}${targetSquare}`);
							if (!move) return false;
							onMove(move);
							return true;
					  }
					: undefined
				// squareRenderer: ({ piece, children }) => {
				// 	if (piece) {
				// 		const isTwitchPiece = (piece.pieceType.startsWith('w') ? 1 : 0) ^ (whoPlaysWhite === 'twitch' ? 1 : 0);
				// 		return (
				// 			<div
				// 				style={{
				// 					position: 'relative',
				// 					width: '100%',
				// 					height: '100%',
				// 					display: 'flex',
				// 					alignItems: 'center',
				// 					justifyContent: 'center'
				// 				}}
				// 			>
				// 				{children}
				// 				<Image
				// 					src={isTwitchPiece ? '/twitch.png' : '/youtube.png'}
				// 					alt={isTwitchPiece ? 'Twitch' : 'YouTube'}
				// 					width={isTwitchPiece ? 30 : 25}
				// 					height={isTwitchPiece ? 30 : 25}
				// 					style={{
				// 						position: 'absolute',
				// 						bottom: '10%',
				// 						right: isTwitchPiece ? '5%' : '10%',
				// 						opacity: 1,
				// 						pointerEvents: 'none',
				// 						zIndex: 5
				// 					}}
				// 				/>
				// 			</div>
				// 		);
				// 	}
				// 	return <>{children}</>;
				// }
			}}
		/>
	);
};
