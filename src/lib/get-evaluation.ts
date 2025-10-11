import { Evaluation } from '@/types/evaluation';

export const getEvaluation = async (fen: string): Promise<Evaluation> => {
	const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=15`);
	const data = await response.json();
	return { evaluation: parseFloat(data.evaluation) * 100, mate: data.mate };
};
