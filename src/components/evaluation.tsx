import { useEvaluation } from '@/hooks/useEvaluation';

type EvaluationProps = {
	game: string;
};

export const Evaluation = ({ game }: EvaluationProps) => {
	const { data: evaluation } = useEvaluation(game);

	const evalValue = evaluation?.evaluation ?? 0;
	let barHeight = 50;
	if (typeof evalValue === 'number') {
		const clampedEval = Math.max(-1000, Math.min(1000, evalValue));
		barHeight = 50 + clampedEval / 20;
		barHeight = Math.max(0, Math.min(100, barHeight));
	}

	return (
		<div className='w-8 bg-red-500 flex-1 self-stretch max-w-8'>
			<div className='h-full bg-blue-500' style={{ height: `${barHeight}%` }} />
			<div className='text-xs text-center'>{evalValue}</div>
		</div>
	);
};
