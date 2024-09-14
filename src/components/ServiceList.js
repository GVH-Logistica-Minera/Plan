// src/components/ServiceList.js
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

const ServiceList = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesCollection = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setServices(servicesList);
    };

    fetchServices();
  }, []);

  return (
    <div>
      <h2>Lista de Servicios</h2>
      <ul>
        {services.map(service => (
          <li key={service.id}>
            {service.client} - {service.type} ({service.schedule})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceList;
