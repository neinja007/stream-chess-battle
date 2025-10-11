import { Move } from '@/hooks/useChat';
import { Dispatch, SetStateAction } from 'react';

export const processMove = (
	testAndTransformMove: (move: string) => string | undefined,
	rawMove: { text: string; user: string },
	setMoves: Dispatch<SetStateAction<Move[]>>
) => {
	const data: { user: string; text: string } = rawMove;
	const transformedMove = testAndTransformMove(data.text);
	if (!transformedMove) {
		return;
	}
	const move: Move = {
		user: data.user || 'unknown',
		move: transformedMove,
		count: 1
	};
	setMoves((prev) => {
		const existingMoveIndex = prev.findIndex((m) => m.move === move.move);
		if (existingMoveIndex !== -1) {
			const newMoves = [...prev];
			newMoves[existingMoveIndex] = {
				...newMoves[existingMoveIndex],
				count: newMoves[existingMoveIndex].count + 1
			};
			return newMoves;
		}
		return [...prev, move];
	});
};
