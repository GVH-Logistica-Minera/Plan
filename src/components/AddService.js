// src/components/AddService.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../config/firebase';

const AddService = () => {
  const [client, setClient] = useState('');
  const [type, setType] = useState('');
  const [moviles, setMoviles] = useState('');
  const [choferes, setChoferes] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [schedule, setSchedule] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "services"), {
        client,
        type,
        moviles: moviles.split(','),
        choferes: choferes.split(','),
        origin,
        destination,
        schedule,
        isCompleted: false,
        date: new Date(),
      });
      alert('Servicio agregado con ID: ' + docRef.id);
    } catch (e) {
      alert('Error al agregar servicio: ' + e.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Cliente" required />
      <input type="text" value={type} onChange={(e) => setType(e.target.value)} placeholder="Tipo de Servicio" required />
      <input type="text" value={moviles} onChange={(e) => setMoviles(e.target.value)} placeholder="Móviles (separados por coma)" required />
      <input type="text" value={choferes} onChange={(e) => setChoferes(e.target.value)} placeholder="Choferes (separados por coma)" required />
      <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Origen" required />
      <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destino" required />
      <input type="text" value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="Horario" required />
      <button type="submit">Agregar Servicio</button>
    </form>
  );
};

export default AddService;
