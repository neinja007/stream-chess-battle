import { Chess } from 'chess.js';
import { useState, useCallback } from 'react';

export const useChessGame = () => {
	const [game] = useState(() => new Chess());
	const [position, setPosition] = useState(game.fen());
	const [legalMoves, setLegalMoves] = useState(game.moves());
	const [turn, setTurn] = useState(game.turn());
	const [result, setResult] = useState<'white' | 'black' | 'draw' | undefined>(undefined);

	const updateGameState = useCallback(() => {
		setPosition(game.fen());
		setLegalMoves(game.moves());
		setTurn(game.turn());
		setResult(
			game.isGameOver() ? (game.isCheckmate() ? (game.turn() === 'w' ? 'black' : 'white') : 'draw') : undefined
		);
	}, [game]);

	// You can check if the game is won or drawn using methods on the `game` instance:
	// - game.isGameOver() returns true if the game has ended (by win or draw).
	// - game.isDraw() returns true if the game ended in a draw.
	// - game.isStalemate(), game.isThreefoldRepetition(), game.isInsufficientMaterial(), game.isCheckmate()
	//   provide more specific end conditions.
	// For a win, check game.isCheckmate(): if true, the player whose turn it is *not* was the winner.
	// For a draw, check game.isDraw(): if true, the game ended in a draw (by stalemate, 50-move rule, etc).

	const move = useCallback(
		(move: string) => {
			const result = game.move(move);
			if (result) {
				updateGameState();
			}
			return result;
		},
		[game, updateGameState]
	);

	const reset = useCallback(() => {
		game.reset();
		updateGameState();
	}, [game, updateGameState]);

	return {
		position,
		move,
		legalMoves,
		reset,
		turn,
		result
	};
};
