import { GameSettings as DefaultSettings } from '@/types/settings';

export const defaultGameSettings: DefaultSettings = {
	moveSelection: undefined,
	playerWhite: {
		platform: undefined,
		channel: ''
	},
	playerBlack: {
		platform: undefined,
		channel: ''
	},
	secondsPerMove: 0,
	evaluationBar: 'show'
};
