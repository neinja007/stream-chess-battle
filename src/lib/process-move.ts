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
		const existingMove = prev.find((m) => m.move === move.move);
		if (existingMove) {
			existingMove.count++;
			return prev;
		}
		return [...prev, move];
	});
};
