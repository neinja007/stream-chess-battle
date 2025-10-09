'use client';

import { useState } from 'react';
import { Settings } from '@/types/settings';
import { defaultSettings } from '@/data/default-settings';
import { SettingsProgress } from '@/components/settings-progress';
import { SettingsSection } from '@/components/settings-section';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [settings, setSettings] = useState<Settings>(defaultSettings);

	const [game] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

	if (status === 'settings') {
		return (
			<div className='w-full max-w-lg mx-auto pt-24'>
				<div className='text-2xl text-center'>Modify settings</div>
				<SettingsProgress settings={settings} />
				<SettingsSection
					title='Player White'
					completed={!!(settings.playerWhite.platform && settings.playerWhite.channel)}
				>
					<Select
						value={settings.playerWhite.platform}
						onValueChange={(value) =>
							setSettings({
								...settings,
								playerWhite: { ...settings.playerWhite, platform: value as 'twitch' | 'youtube' }
							})
						}
					>
						<SelectTrigger>
							<SelectValue placeholder='Select platform' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='twitch'>Twitch</SelectItem>
							<SelectItem value='youtube'>YouTube</SelectItem>
						</SelectContent>
					</Select>
				</SettingsSection>
			</div>
		);
	}

	return <div className='py-5 px-20 text-xl'></div>;
}
