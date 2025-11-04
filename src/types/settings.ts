export type GameSettings = {
	moveSelection: 'mostVotes' | 'weightedRandom' | 'random' | undefined;
	playerWhite: Player;
	playerBlack: Player;
	secondsPerMove: number;
	evaluationBar: 'show' | 'hide' | undefined;
	voteRestriction: VoteRestriction | undefined;
};

export type VoteRestriction = 'noRestriction' | '1VotePerUser' | 'uniqueVotesPerUser';

export type PlaySettings = {
	theme: 'standard' | 'blue-purple';
	squareCoordinates: 'show' | 'hide';
	boardOrientation: 'white' | 'black';
};

export type Player = {
	platform: 'twitch' | 'youtube' | 'self' | undefined;
	channel: string;
};

export type PlayerInfo = {
	platform: 'twitch' | 'youtube' | 'self';
	channel: string;
};
