import React, { createContext, useEffect, useState } from 'react';
import { Error } from '../types';




export interface ErrorContextType {
	setError: (error: Error | null) => void | null;
	error: Error | null;
}

export let ErrorProviderContext = createContext<ErrorContextType>({
	setError: () => { },
	error: null,
});

export function ErrorProvider({ children }: { children: React.ReactNode }) {
	const [error, setError] = useState<Error | null>(null);
	return (
		<ErrorProviderContext.Provider value={{ setError, error }}>
			{children}
		</ErrorProviderContext.Provider>
	);
}
