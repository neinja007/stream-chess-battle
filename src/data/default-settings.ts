import { Settings } from '@/types/settings';

export const defaultSettings: Settings = {
	moveSelection: undefined,
	playerWhite: {
		platform: undefined,
		channel: ''
	},
	playerBlack: {
		platform: undefined,
		channel: ''
	},
	secondsPerMove: 30,
	evaluationBar: 'hide'
};
