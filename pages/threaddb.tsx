import { useState, useEffect, FormEvent, useRef } from 'react';
import { Astronaut, findAllAstronauts, createAstronaut, deleteAstronaut } from '../textile/db';
import { useDbProvider } from './_app';

export default function ThreadDb() {
    const [astronauts, setAstronauts] = useState<Astronaut[]>([]);
    const { threadDb } = useDbProvider();
    const nameRef = useRef<HTMLInputElement>(null);
    const missionsRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function init() {
            const fetchedAstronauts = await findAllAstronauts(threadDb);
            setAstronauts(fetchedAstronauts);
        }

        init();
    }, [threadDb]);

    async function onCreateNewAstronaut(e: FormEvent) {
        e.preventDefault();

        if (nameRef.current && missionsRef.current) {
            const newAstronaut = {
                name: nameRef.current.value,
                missions: Number(missionsRef.current.value),
            };

            const instanceId = await createAstronaut(threadDb, {
                ...newAstronaut,
                _id: '',
            });

            setAstronauts((astronauts) => [...astronauts, { ...newAstronaut, _id: instanceId }]);

            nameRef.current.value = '';
            missionsRef.current.value = '';
        }
    }

    async function onDeleteAstronaut(id: string) {
        const instanceId = await deleteAstronaut(threadDb, id);
        setAstronauts((astronauts) => astronauts.filter((astronaut) => astronaut._id !== instanceId));
    }

    return (
        <div className='layout space-y-3'>
            <h1 className='text-lg'>ThreadDB data store</h1>
            <div className='space-y-2'>
                <h2 className='font-bold'>Astronauts</h2>
                <ul>
                    {astronauts.length === 0 ? (
                        <li>Loading...</li>
                    ) : (
                        astronauts.map((astronaut) => (
                            <li
                                className='cursor-pointer'
                                key={astronaut._id}
                                onClick={() => onDeleteAstronaut(astronaut._id)}
                            >
                                {astronaut.name}
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <form onSubmit={onCreateNewAstronaut}>
                <h2 className='text-lg font-bold mt-6'>Create a new astronaut</h2>
                <label htmlFor='name' className='block'>
                    Astronaut name
                </label>
                <input
                    ref={nameRef}
                    id='name'
                    className='w-full border border-gray-900 px-3 py-2 mb-2'
                    placeholder='Cool name'
                />
                <label htmlFor='missions' className='block'>
                    Number of missions
                </label>
                <input
                    ref={missionsRef}
                    id='missions'
                    className='w-full border border-gray-900 px-3 py-2 mb-2'
                    placeholder='1234089724'
                />
                <button className='bg-gray-700 text-gray-200 px-3 py-2'>Submit Astronaut</button>
            </form>
        </div>
    );
}
