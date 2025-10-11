import { useEvaluation } from '@/hooks/useEvaluation';

type EvaluationProps = {
	game: string;
	orientation: 'white' | 'black';
};

export const Evaluation = ({ game, orientation }: EvaluationProps) => {
	const { data: evaluation } = useEvaluation(game);

	const evalValue = evaluation?.evaluation ?? 0;
	let barHeight = 50;
	if (typeof evalValue === 'number') {
		const clampedEval = Math.max(-1000, Math.min(1000, evalValue));
		// Use a sigmoid to map evaluation to [0, 100]%
		const sigmoid = (x: number) => 1 / (1 + Math.exp(-x / 300));
		barHeight = sigmoid(clampedEval) * 100;
	}

	return (
		<>
			<div
				className='w-8 bg-gray-700 flex-1 self-stretch max-w-8 rounded-lg overflow-hidden flex flex-col justify-between'
				style={{ rotate: orientation === 'white' ? '180deg' : '0deg' }}
			>
				<div className='h-full bg-white transition-all duration-500 ease-in-out' style={{ height: `${barHeight}%` }} />
				<div
					className='text-xs text-center m-2 text-white font-bold'
					style={{ rotate: orientation === 'white' ? '180deg' : '0deg' }}
				>
					{(evalValue / 100).toFixed(1)}
				</div>
			</div>
		</>
	);
};
