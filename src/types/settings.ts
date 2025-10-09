export type Settings = {
	moveSelection: 'mostVotes' | 'weightedRandom' | 'random' | undefined;
	playerWhite: Player;
	playerBlack: Player;
	secondsPerMove: number;
	evaluationBar: 'show' | 'hide';
};

export type Player = {
	platform: 'twitch' | 'youtube' | undefined;
	channel: string;
};
