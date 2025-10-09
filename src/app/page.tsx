'use client';

import { useState } from 'react';
import { Settings } from '@/types/settings';
import { defaultSettings } from '@/data/default-settings';
import { SettingsProgress } from '@/components/settings-progress';
import { SettingsSection } from '@/components/settings-section';
import { SimpleSelect } from '@/components/simple-select';
import { SiTwitch, SiYoutube } from '@icons-pack/react-simple-icons';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { ChartNoAxesColumnDecreasing, Dices, Save, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSettingsCompletion } from '@/lib/settings-completion';

export default function Home() {
	const [status, setStatus] = useState<'settings' | 'playing'>('settings');
	const [settings, setSettings] = useState<Settings>(defaultSettings);

	const [game] = useState<string>('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

	if (status === 'settings') {
		return (
			<div className='w-full max-w-lg mx-auto pt-24 flex flex-col gap-4'>
				<div>
					<div className='text-2xl text-center'>Game settings</div>
					<SettingsProgress settings={settings} />
				</div>
				<SettingsSection
					title='Player White'
					completed={!!(settings.playerWhite.platform && settings.playerWhite.channel)}
				>
					<SimpleSelect
						value={settings.playerWhite.platform}
						onChange={(value) =>
							setSettings({
								...settings,
								playerWhite: { ...settings.playerWhite, platform: value as 'twitch' | 'youtube' }
							})
						}
						options={[
							{ label: 'Twitch', value: 'twitch', icon: SiTwitch },
							{ label: 'YouTube', value: 'youtube', icon: SiYoutube }
						]}
						placeholder='Select platform'
					/>
					<InputGroup>
						{settings.playerWhite.platform && (
							<InputGroupAddon>
								{settings.playerWhite.platform === 'twitch'
									? 'twitch.tv/'
									: settings.playerWhite.platform === 'youtube'
									? 'youtube.com/@'
									: ''}
							</InputGroupAddon>
						)}
						<InputGroupInput
							placeholder='Channel'
							value={settings.playerWhite.channel}
							onChange={(e) =>
								setSettings({
									...settings,
									playerWhite: { ...settings.playerWhite, channel: e.target.value.replaceAll(' ', '-') }
								})
							}
						/>
					</InputGroup>
				</SettingsSection>
				<SettingsSection
					title='Player Black'
					completed={!!(settings.playerBlack.platform && settings.playerBlack.channel)}
				>
					<SimpleSelect
						value={settings.playerBlack.platform}
						onChange={(value) =>
							setSettings({
								...settings,
								playerBlack: { ...settings.playerBlack, platform: value as 'twitch' | 'youtube' }
							})
						}
						options={[
							{ label: 'Twitch', value: 'twitch', icon: SiTwitch },
							{ label: 'YouTube', value: 'youtube', icon: SiYoutube }
						]}
						placeholder='Select platform'
					/>
					<InputGroup>
						{settings.playerBlack.platform && (
							<InputGroupAddon>
								{settings.playerBlack.platform === 'twitch'
									? 'twitch.tv/'
									: settings.playerBlack.platform === 'youtube'
									? 'youtube.com/@'
									: ''}
							</InputGroupAddon>
						)}
						<InputGroupInput
							placeholder='Channel'
							value={settings.playerBlack.channel}
							onChange={(e) =>
								setSettings({
									...settings,
									playerBlack: { ...settings.playerBlack, channel: e.target.value.replaceAll(' ', '-') }
								})
							}
						/>
					</InputGroup>
				</SettingsSection>
				<SettingsSection title='Time control' completed={!!settings.secondsPerMove} orientation='vertical' inline>
					<Slider
						value={[settings.secondsPerMove]}
						onValueChange={(value) => setSettings({ ...settings, secondsPerMove: value[0] })}
						min={0}
						max={120}
						step={1}
					/>
					<div className='text-sm'>{settings.secondsPerMove} seconds per move</div>
				</SettingsSection>
				<SettingsSection title='Evaluation bar' completed={!!settings.evaluationBar} inline>
					<Switch
						checked={settings.evaluationBar === 'show'}
						onCheckedChange={(checked) => setSettings({ ...settings, evaluationBar: checked ? 'show' : 'hide' })}
					/>
				</SettingsSection>
				<SettingsSection title='Move selection' completed={!!settings.moveSelection} inline>
					<SimpleSelect
						value={settings.moveSelection}
						onChange={(value) =>
							setSettings({ ...settings, moveSelection: value as 'mostVotes' | 'weightedRandom' | 'random' })
						}
						options={[
							{ label: 'Most votes', value: 'mostVotes', icon: Dices },
							{ label: 'Weighted random', value: 'weightedRandom', icon: Weight },
							{ label: 'Random', value: 'random', icon: ChartNoAxesColumnDecreasing }
						]}
						placeholder='Select an option'
					/>
				</SettingsSection>
				<Button
					onClick={() => setStatus('playing')}
					disabled={getSettingsCompletion(settings) !== 1}
					variant={'outline'}
				>
					<Save className='size-4' /> Save settings & start game
				</Button>
			</div>
		);
	}

	return <div className='py-5 px-20 text-xl'></div>;
}
