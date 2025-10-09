import { Settings as SettingsType } from '@/types/settings';

type PlayingProps = {
	settings: SettingsType;
	setStatus: (status: 'settings' | 'playing') => void;
};

export const Playing = ({ settings, setStatus }: PlayingProps) => {
	return <div>Playing</div>;
};
