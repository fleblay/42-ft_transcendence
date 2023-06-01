import React, { createContext, useEffect, useState } from 'react';
import { UserInfo } from '../types';


export interface UserContextType {
	userData: UserInfo | null;
	setUserData: (user: UserInfo | null) => void | null;
}

export let UserDataContext = createContext<UserContextType>({
	userData: null,
	setUserData: () => { }
});

export function UserDataProvider({ children }: { children: React.ReactNode }) {
	const [userData, setUserData] = useState<UserInfo | null>(null);





	return (
		<UserDataContext.Provider value={{ userData, setUserData }}>
			{children}
		</UserDataContext.Provider>
	);
}
