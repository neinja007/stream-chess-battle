import { GameSettings } from '@/types/settings';

export const getSettingsCompletion = (settings: GameSettings): number => {
	const settingsCompletion: boolean[] = [
		settings.moveSelection !== undefined,
		settings.playerWhite.platform !== undefined,
		settings.playerBlack.platform !== undefined,
		settings.playerWhite.channel !== '',
		settings.playerBlack.channel !== '',
		settings.secondsPerMove !== 0
		// settings.evaluationBar !== undefined
	];

	return settingsCompletion.filter(Boolean).length / settingsCompletion.length;
};
