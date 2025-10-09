import { Chessboard as ChessboardComponent } from 'react-chessboard';

type ChessboardProps = {
	game: string;
};

export const Chessboard = ({ game }: ChessboardProps) => {
	return (
		<ChessboardComponent
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
				allowDrawingArrows: false
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
