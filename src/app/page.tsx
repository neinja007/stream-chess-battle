'use client';

import { useState } from 'react';
import { GameSettings as SettingsType } from '@/types/settings';
import { defaultGameSettings } from '@/data/default-settings';
import { Settings } from '@/components/settings';
import { Playing } from '@/components/playing';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [gameSettings, setGameSettings] = useState<SettingsType>(defaultGameSettings);

	if (status === 'settings') {
		return <Settings settings={gameSettings} setSettings={setGameSettings} setStatus={setStatus} />;
	} else {
		return <Playing settings={gameSettings} setStatus={setStatus} />;
	}
}
