
import React from 'react';

export function useDebouncedState<T = any>(defaultValue: T, wait: number, options = { leading: false }): readonly [T, (newValue: T) => void] {
	const [value, setValue] = React.useState<T>(defaultValue);
	const timeoutRef = React.useRef<number | null>(null);
	const leadingRef = React.useRef(true);
	const clearTimeout = () => window.clearTimeout(timeoutRef.current ?? undefined);
	React.useEffect(() => clearTimeout, []);
	const debouncedSetValue = (newValue: T) => {
		clearTimeout();
		if (leadingRef.current && options.leading) {
			setValue(newValue);
		} else {
			timeoutRef.current = window.setTimeout(() => {
				leadingRef.current = true;
				setValue(newValue);
			}, wait);
		}
		leadingRef.current = false;
	};
	return [value, debouncedSetValue];
}

export function useDebouncedValue<T = any>(value: T, wait: number, options = { leading: false }): readonly [T, () => void] {
	const [_value, setValue] = React.useState(value);
	const mountedRef = React.useRef(false);
	const timeoutRef = React.useRef<number | null>(null);
	const cooldownRef = React.useRef(false);
	const cancel = () => window.clearTimeout(timeoutRef.current ?? undefined);
	React.useEffect(() => {
		if (mountedRef.current) {
			if (!cooldownRef.current && options.leading) {
				cooldownRef.current = true;
				setValue(value);
			} else {
				cancel();
				timeoutRef.current = window.setTimeout(() => {
					cooldownRef.current = false;
					setValue(value);
				}, wait);
			}
		}
	}, [value, options.leading, wait]);
	React.useEffect(() => {
		mountedRef.current = true;
		return cancel;
	}, []);
	return [_value, cancel];
}