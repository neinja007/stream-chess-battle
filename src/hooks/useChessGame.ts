import { Chess } from 'chess.js';
import { useState, useCallback } from 'react';

export const useChessGame = () => {
	const [game] = useState(() => new Chess());
	const [position, setPosition] = useState(game.fen());
	const [gameOver, setGameOver] = useState(game.isGameOver());
	const [legalMoves, setLegalMoves] = useState(game.moves());
	const [turn, setTurn] = useState(game.turn());

	const updateGameState = useCallback(() => {
		setPosition(game.fen());
		setGameOver(game.isGameOver());
		setLegalMoves(game.moves());
		setTurn(game.turn());
	}, [game]);

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
		gameOver,
		legalMoves,
		reset,
		turn
	};
};
