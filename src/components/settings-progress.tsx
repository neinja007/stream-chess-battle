import { Settings } from '@/types/settings';
import { Progress } from './ui/progress';

type SettingsProgressProps = {
	settings: Settings;
};

export const SettingsProgress = ({ settings }: SettingsProgressProps) => {
	const settingsCompletion: boolean[] = [
		settings.moveSelection !== undefined,
		settings.playerWhite.platform !== undefined,
		settings.playerBlack.platform !== undefined,
		settings.playerWhite.channel !== '',
		settings.playerBlack.channel !== '',
		settings.secondsPerMove !== 0
		// settings.evaluationBar !== undefined
	];

	const completion = settingsCompletion.filter(Boolean).length / settingsCompletion.length;

	return <Progress value={completion * 100} className='mt-2' />;
};
