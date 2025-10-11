import { Chess } from 'chess.js';

export const testAndTransformMove = (fen: string, move: string) => {
	const chess = new Chess(fen);

	const moveResult = chess.move(move, { strict: false });
	if (!moveResult) {
		return undefined;
	}

	return moveResult.san;
};
