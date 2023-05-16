import React, { createContext, useEffect, useState } from 'react';
import { CustomError } from '../types';

export interface ErrorContextType {
	setError: (error: CustomError | null) => void | null;
	error: CustomError | null;
}

export let ErrorProviderContext = createContext<ErrorContextType>({
	setError: () => { },
	error: null,
});

export function ErrorProvider({ children }: { children: React.ReactNode }) {
	const [error, setError] = useState<CustomError | null>(null);
	return (
		<ErrorProviderContext.Provider value={{ setError, error }}>
			{children}
		</ErrorProviderContext.Provider>
	);
}
