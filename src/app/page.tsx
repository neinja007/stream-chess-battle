'use client';

import { useState } from 'react';
import { Settings as SettingsType } from '@/types/settings';
import { defaultSettings } from '@/data/default-settings';
import { Settings } from '@/components/settings';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [settings, setSettings] = useState<SettingsType>(defaultSettings);

	const [game] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

	if (status === 'settings') {
		return <Settings settings={settings} setSettings={setSettings} setStatus={setStatus} />;
	}

	return <div className='py-5 px-20 text-xl'></div>;
}
