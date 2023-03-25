import { FormEvent, useState } from "react";

type NameSelectorProps = {
    onSelect : (name: string) => void;  
}

export function NameSelector({onSelect}: NameSelectorProps)
{

    const [error, setError] = useState('');
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const name = new FormData(e.currentTarget as HTMLFormElement).get('name');
        if (!name){
            setError('You need choose a name');
            return;
        }
        onSelect(name.toString());
    }

    return <>
        <h1> you need choose a name</h1>
        <form action="" onSubmit={handleSubmit}>
              <label htmlFor="name"> Your name</label>
            <input type="text" id="name" name="name" required />
            <button> Choose </button>
        </form>
        </>
}