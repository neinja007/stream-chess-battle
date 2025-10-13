import { LucideIcon } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

type SimpleSelectProps = {
	value: string | undefined;
	onChange: (value: string | undefined) => void;
	options: { label: string; value: string; icon?: LucideIcon }[];
	placeholder: string;
};

export const SimpleSelect = ({ value, onChange, options, placeholder }: SimpleSelectProps) => {
	return (
		<Select value={value ?? undefined} onValueChange={onChange}>
			<SelectTrigger>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{options.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.icon && <option.icon className='size-4' />}
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
};
