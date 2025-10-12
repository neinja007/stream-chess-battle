import { useEvaluation } from '@/hooks/useEvaluation';
import { cn } from '@/lib/utils';

type EvaluationProps = {
	game: string;
	orientation: 'white' | 'black';
	result?: 'white' | 'black' | 'draw';
};

export const Evaluation = ({ game, orientation, result }: EvaluationProps) => {
	const { data: evaluation, fetchStatus } = useEvaluation(game);

	const evalValue = evaluation?.evaluation && parseFloat(evaluation?.evaluation.toString());
	let barHeight = 50;
	if (evalValue) {
		const clampedEval = Math.max(-1000, Math.min(1000, evalValue));
		// Use a sigmoid to map evaluation to [0, 100]%
		const sigmoid = (x: number) => 1 / (1 + Math.exp(-x / 300));
		barHeight = sigmoid(clampedEval) * 100;
	} else if (evaluation?.mate) {
		barHeight = parseFloat(evaluation.mate) > 0 ? 100 : 0;
	}

	return (
		<>
			<div
				className={cn(
					'w-8 bg-gray-700 flex-1 self-stretch max-w-8 rounded-lg overflow-hidden flex flex-col justify-between',
					fetchStatus === 'fetching' && !result && 'animate-pulse'
				)}
				style={{ rotate: orientation === 'white' ? '180deg' : '0deg' }}
			>
				{!result && (
					<div
						className='h-full bg-white transition-all duration-500 ease-in-out'
						style={{ height: `${barHeight}%` }}
					/>
				)}
				{result === 'white' && (
					<div className='h-full bg-white transition-all duration-500 ease-in-out' style={{ height: `100%` }} />
				)}
				{result === 'black' && (
					<div className='h-full bg-white transition-all duration-500 ease-in-out' style={{ height: `0%` }} />
				)}
				{result === 'draw' && (
					<div className='h-full bg-white transition-all duration-500 ease-in-out' style={{ height: `50%` }} />
				)}
				<div
					className='text-xs text-center my-1 bg-gray-700 text-white w-fit mx-auto px-1 rounded-md absolute bottom-0 left-0 right-0 font-bold'
					style={{
						rotate: orientation === 'white' ? '180deg' : '0deg'
					}}
				>
					{result
						? result === 'white'
							? '1-0'
							: result === 'black'
							? '0-1'
							: '½-½'
						: evaluation?.mate
						? 'M' + Math.abs(parseInt(evaluation?.mate))
						: evalValue === undefined || isNaN(evalValue) || !isFinite(evalValue)
						? '∞'
						: (evalValue / 100).toFixed(Math.abs(evalValue) > 1000 ? 0 : 1)}
				</div>
			</div>
		</>
	);
};
