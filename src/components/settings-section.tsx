import { cn } from '@/lib/utils';
import { CircleCheck } from 'lucide-react';

type SettingsSectionProps = {
	title: string;
	children: React.ReactNode;
	completed: boolean;
	orientation?: 'horizontal' | 'vertical';
	inline?: boolean;
};

export const SettingsSection = ({
	title,
	children,
	completed,
	orientation = 'horizontal',
	inline = false
}: SettingsSectionProps) => {
	return (
		<div className='flex flex-col gap-2 mt-3'>
			<div className={'flex justify-between items-center'}>
				<h2 className='text-xl'>{title}</h2>
				{!inline && completed && <CircleCheck className='size-4 text-green-500' />}
				{inline && (
					<div
						className={cn(
							'flex justify-end items-center w-1/2 gap-1',
							orientation === 'horizontal' && 'flex-row',
							orientation === 'vertical' && 'flex-col'
						)}
					>
						{children}
					</div>
				)}
			</div>
			{!inline && (
				<div
					className={cn(
						'flex justify-between items-center gap-3',
						orientation === 'horizontal' && 'flex-row',
						orientation === 'vertical' && 'flex-col'
					)}
				>
					{children}
				</div>
			)}
		</div>
	);
};
