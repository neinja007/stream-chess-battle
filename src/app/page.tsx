'use client';

import { useState } from 'react';
import { Settings as SettingsType } from '@/types/settings';
import { defaultSettings } from '@/data/default-settings';
import { Settings } from '@/components/settings';
import { Playing } from '@/components/playing';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [settings, setSettings] = useState<SettingsType>(defaultSettings);

	if (status === 'settings') {
		return <Settings settings={settings} setSettings={setSettings} setStatus={setStatus} />;
	} else {
		return <Playing settings={settings} setStatus={setStatus} />;
	}
}
