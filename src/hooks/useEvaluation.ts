import { getEvaluation } from '@/lib/get-evaluation';
import { useQuery } from '@tanstack/react-query';

export const useEvaluation = (fen: string) => {
	return useQuery({
		queryKey: ['evaluation', fen],
		queryFn: () => getEvaluation(fen),
		placeholderData: (previousData) => previousData
	});
};
