import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import ServiceForm from './components/ServiceForm';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Modal from 'react-modal';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from './config/firebase';

const EDITOR_PASSWORD = "tu_contraseña"; 
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

Modal.setAppElement('#root');

function App() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [services, setServices] = useState(Array(31).fill([]));
  const [showForm, setShowForm] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [selectedService, setSelectedService] = useState(null); 
  const [modalIsOpen, setModalIsOpen] = useState(false); 
  const [reportType, setReportType] = useState('mensual'); // Tipo de reporte

  const sliderRef = useRef(null);

  const fetchServices = useCallback(async () => {
    try {
      const servicesCollection = collection(db, `services_${selectedMonth}`);
      const servicesSnapshot = await getDocs(servicesCollection);
      const servicesData = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const updatedServices = Array(31).fill([]).map((_, dayIndex) => {
        return servicesData.filter(service => new Date(service.date.seconds * 1000).getDate() === dayIndex + 1);
      });
      setServices(updatedServices);
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchServices();
  }, [selectedMonth, fetchServices]);

  const getWeekday = (day, month, year) => {
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const date = new Date(year, month, day);
    return `${weekdays[date.getDay()]} ${day}`;
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const filteredServices = services.map(dayServices =>
    dayServices.filter(service =>
      service.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.choferes.some(chofer => chofer.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  const handleSaveService = async (serviceDetails) => {
    const updatedServices = [...services];
    try {
      if (editingService) {
        const { dayIndex, serviceIndex } = editingService;
        const serviceDocRef = doc(db, `services_${selectedMonth}`, updatedServices[dayIndex][serviceIndex].id);
        await updateDoc(serviceDocRef, serviceDetails);
        updatedServices[dayIndex][serviceIndex] = serviceDetails;
      } else {
        const newService = { ...serviceDetails, date: new Date() };
        const docRef = await addDoc(collection(db, `services_${selectedMonth}`), newService);
        updatedServices[currentDay] = [...updatedServices[currentDay], { ...newService, id: docRef.id }];
      }
      setServices(updatedServices);
      setShowForm(false);
      setEditingService(null);
    } catch (error) {
      console.error("Error al guardar el servicio:", error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === EDITOR_PASSWORD) {
      setIsAuthenticated(true);
      alert("Autenticación exitosa.");
    } else {
      alert("Contraseña incorrecta.");
    }
    setPassword('');
  };

  const handleAddService = (dayIndex) => {
    if (isAuthenticated) {
      setCurrentDay(dayIndex);
      setEditingService(null);
      setShowForm(true);
    } else {
      alert("No tienes permisos para agregar un servicio.");
    }
  };

  const handleEditService = (dayIndex, serviceIndex) => {
    if (isAuthenticated) {
      setCurrentDay(dayIndex);
      setEditingService({ dayIndex, serviceIndex, data: services[dayIndex][serviceIndex] });
      setShowForm(true);
    } else {
      alert("No tienes permisos para editar este servicio.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  const toggleCompleteService = (dayIndex, serviceIndex) => {
    const updatedServices = [...services];
    updatedServices[dayIndex][serviceIndex].isCompleted = !updatedServices[dayIndex][serviceIndex].isCompleted;
    setServices(updatedServices);
  };

  const openModal = (service) => {
    setSelectedService(service);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedService(null);
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF();
    doc.text(`Reporte ${reportType}`, 14, 16);

    let filteredServicesForReport = services.flatMap((dayServices, dayIndex) =>
      dayServices.map(service => [
        dayIndex + 1,
        service.client,
        service.type,
        service.moviles.join(', '),
        service.choferes.join(', '),
        service.origin,
        service.destination,
        service.schedule,
        service.comments || ''
      ])
    );

    doc.autoTable({
      head: [['Día', 'Cliente', 'Tipo', 'Móviles', 'Choferes', 'Origen', 'Destino', 'Horario', 'Comentarios']],
      body: filteredServicesForReport,
    });

    doc.save(`reporte-${reportType}.pdf`);
  };

  const getServiceColor = (type) => {
    switch (type.toLowerCase()) {
      case 'in out':
        return '#cce5ff'; // Celeste
      case 'subida/bajada':
        return '#d4edda'; // Verde
      case 'bajada/subida':
        return '#f8d7da'; // Rojo
      case 'stand by':
        return '#fff3cd'; // Amarillo
      default:
        return '#ffffff'; // Blanco por defecto
    }
  };

  const totalViajes = services.flat().length;
  const viajesPendientes = services.flat().filter(service => !service.isCompleted).length;
  const clientesUnicos = [...new Set(services.flat().map(service => service.client))].length;

  return (
    <div className="App">
      <h1>Planificación de Servicios</h1>

      <div style={{ marginBottom: '20px' }}>
        <label>Seleccionar Mes: </label>
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
          {MONTHS.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div className="metrics">
        <p>Total de viajes: {totalViajes}</p>
        <p>Viajes pendientes: {viajesPendientes}</p>
        <p>Clientes únicos: {clientesUnicos}</p>
      </div>

      <input
        type="text"
        placeholder="Buscar por cliente o chofer"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: '10px', marginBottom: '20px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
      />

      {!isAuthenticated && (
        <div className="login-container" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleLogin}>
            <label>Ingrese su contraseña:</label>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: '10px', marginBottom: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
            />
            <button type="submit" style={{ padding: '10px 20px', borderRadius: '5px', border: '1px solid #ccc', background: '#007BFF', color: '#fff' }}>
              Entrar
            </button>
          </form>
        </div>
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Detalles del Servicio"
        style={{
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '80%',
            overflow: 'auto',
          }
        }}
      >
        {selectedService && (
          <div>
            <h2>Detalles del Servicio</h2>
            <p><strong>Cliente:</strong> {selectedService.client}</p>
            <p><strong>Tipo de Servicio:</strong> {selectedService.type}</p>
            <p><strong>Móviles:</strong> {selectedService.moviles.join(', ')}</p>
            <p><strong>Choferes:</strong> {selectedService.choferes.join(', ')}</p>
            <p><strong>Origen:</strong> {selectedService.origin}</p>
            <p><strong>Destino:</strong> {selectedService.destination}</p>
            <p><strong>Horario:</strong> {selectedService.schedule}</p>
            <p><strong>Comentarios:</strong> {selectedService.comments}</p>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        )}
      </Modal>

      <div>
        <label>Generar Reporte: </label>
        <select value={reportType} onChange={(e) => setReportType(e.target.value)} style={{ marginRight: '10px' }}>
          <option value="semanal">Semanal</option>
          <option value="mensual">Mensual</option>
          <option value="anual">Anual</option>
        </select>
        <button onClick={handleGeneratePDF}>Generar PDF</button>
      </div>

      <div className="nav-buttons">
        <button onClick={() => sliderRef.current.slickPrev()}>← Anterior</button>
        <button onClick={() => sliderRef.current.slickNext()}>Siguiente →</button>
      </div>

      {showForm ? (
        <ServiceForm 
          onSave={handleSaveService} 
          onCancel={handleCancel} 
          initialData={editingService ? editingService.data : null} 
        />
      ) : (
        <Slider ref={sliderRef} {...{
          dots: true,
          infinite: true,
          speed: 500,
          slidesToShow: 7,
          slidesToScroll: 1,
          responsive: [
            { breakpoint: 1024, settings: { slidesToShow: 5, slidesToScroll: 1 } },
            { breakpoint: 600, settings: { slidesToShow: 3, slidesToScroll: 1 } },
            { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 1 } }
          ]
        }}>
          {Array.from({ length: getDaysInMonth(selectedMonth, new Date().getFullYear()) }).map((_, index) => (
            <div
              key={index}
              className="carousel-item"
              style={{ backgroundColor: getServiceColor(services[index]?.[0]?.type || '') }}
            >
              <h2>{getWeekday(index + 1, selectedMonth, new Date().getFullYear())}</h2>
              <button onClick={() => handleAddService(index)} disabled={!isAuthenticated}>
                Agregar Servicio
              </button>
              <ul>
                {filteredServices[index]?.map((service, i) => (
                  <li key={i} style={{ backgroundColor: service.isCompleted ? '#d4edda' : 'white' }}>
                    <strong>{service.client}</strong> - {service.type} ({service.schedule})
                    <br />
                    <strong>Móviles:</strong> {service.moviles.join(', ')}
                    <br />
                    <strong>Choferes:</strong> {service.choferes.join(', ')}
                    <br />
                    <strong>Origen:</strong> {service.origin} - <strong>Destino:</strong> {service.destination}
                    <br />
                    <button onClick={() => openModal(service)}>Ver Detalles</button>
                    <button onClick={() => handleEditService(index, i)} disabled={!isAuthenticated}>
                      Editar
                    </button>
                    <button onClick={() => toggleCompleteService(index, i)}>
                      {service.isCompleted ? 'Servicio Finalizado ✔' : 'Marcar como Finalizado'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
}

export default App;
