import { Chess } from 'chess.js';

export const testAndTransformMove = (fen: string, move: string) => {
	const chess = new Chess(fen);

	try {
		const moveResult = chess.move(move, { strict: false });
		if (!moveResult.san) {
			return undefined;
		} else {
			return moveResult.san;
		}
	} catch {
		return undefined;
	}
};
