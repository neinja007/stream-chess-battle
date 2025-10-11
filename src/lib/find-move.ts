import { Move } from '@/hooks/useChat';

export const findMove = (moves: Move[], strategy: 'mostVotes' | 'weightedRandom' | 'random', legalMoves: string[]) => {
	if (moves.length === 0) {
		return legalMoves[Math.floor(Math.random() * legalMoves.length)];
	}

	switch (strategy) {
		case 'mostVotes':
			return moves.sort((a, b) => b.count - a.count)[0].move;
		case 'weightedRandom':
			return moves.reduce((acc: string[], move) => {
				for (let i = 0; i < move.count; i++) {
					acc.push(move.move);
				}
				return acc;
			}, [])[Math.floor(Math.random() * moves.length)];
		case 'random':
			return moves[Math.floor(Math.random() * moves.length)].move;
	}
};
