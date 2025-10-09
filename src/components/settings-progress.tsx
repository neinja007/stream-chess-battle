import { Settings } from '@/types/settings';
import { Progress } from './ui/progress';
import { getSettingsCompletion } from '@/lib/settings-completion';

type SettingsProgressProps = {
	settings: Settings;
};

export const SettingsProgress = ({ settings }: SettingsProgressProps) => {
	const completion = getSettingsCompletion(settings);
	return <Progress value={completion * 100} className='mt-2' />;
};
