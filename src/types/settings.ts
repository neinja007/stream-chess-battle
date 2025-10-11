export type GameSettings = {
	moveSelection: 'mostVotes' | 'weightedRandom' | 'random' | undefined;
	playerWhite: Player;
	playerBlack: Player;
	secondsPerMove: number;
	evaluationBar: 'show' | 'hide' | undefined;
};

export type PlaySettings = {
	theme: 'standard' | 'blue-purple';
	squareCoordinates: 'show' | 'hide';
	boardOrientation: 'white' | 'black';
};

export type Player = {
	platform: 'twitch' | 'youtube' | undefined;
	channel: string;
};

export type PlayerInfo = {
	platform: 'twitch' | 'youtube';
	channel: string;
};
