import { CircleCheck } from 'lucide-react';

type SettingsSectionProps = {
	title: string;
	children: React.ReactNode;
	completed: boolean;
};

export const SettingsSection = ({ title, children, completed }: SettingsSectionProps) => {
	return (
		<div className='flex flex-col gap-2 mt-3'>
			<div className='flex justify-between items-center'>
				<h2 className='text-xl'>{title}</h2>
				{completed && <CircleCheck className='size-4 text-green-500' />}
			</div>
			<div className='flex justify-between items-center gap-3'>{children}</div>
		</div>
	);
};
