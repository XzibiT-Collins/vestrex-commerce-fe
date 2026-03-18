import { Check } from 'lucide-react';

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    id?: string;
    className?: string;
}

export const Checkbox = ({ checked, onChange, label, id, className = '' }: CheckboxProps) => {
    const inputId = id || `checkbox-${Math.random().toString(36).slice(2, 9)}`;

    return (
        <label
            htmlFor={inputId}
            className={`flex items-center gap-2.5 cursor-pointer group select-none ${className}`}
        >
            <div className="relative shrink-0">
                <input
                    id={inputId}
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="sr-only"
                />
                <div
                    className={`h-5 w-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center
            ${checked
                            ? 'bg-accent-dark border-accent-dark'
                            : 'bg-white dark:bg-zinc-900 border-[#D4D4D4] dark:border-zinc-600 group-hover:border-accent-dark/60'
                        }`}
                >
                    {checked && (
                        <Check className="h-3 w-3 text-[#1A1A1A] stroke-[3]" />
                    )}
                </div>
            </div>
            {label && (
                <span className="text-sm text-[#1A1A1A] dark:text-white">{label}</span>
            )}
        </label>
    );
};
