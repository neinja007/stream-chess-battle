import { Chess } from 'chess.js';

export const useChessGame = () => {
	const game = new Chess();

	return {
		position: game.fen(),
		move: game.move,
		gameOver: game.isGameOver(),
		legalMoves: game.moves(),
		reset: game.reset,
		turn: game.turn()
	};
};
