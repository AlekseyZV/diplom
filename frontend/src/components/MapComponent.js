// src/components/MapComponent.js
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Кастомная иконка маркера (красный флаг/маркер)
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Альтернативный вариант - синий маркер
const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Зеленый маркер
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const MapComponent = () => {
    // Координаты для Ярославля (Речной порт)
    const yaroslavlPosition = [57.636601, 39.868813];
    
    // Координаты для Лосино-Петровского
    const losinoPosition = [55.8686, 38.2006];

    return (
        <MapContainer 
            center={yaroslavlPosition} 
            zoom={10} 
            style={{ height: '400px', width: '100%', borderRadius: '8px', zIndex: 1 }}
            scrollWheelZoom={true}  // Включаем масштабирование колесиком мыши
            zoomControl={true}       // Включаем кнопки зума
            attributionControl={false} // Убираем надпись "Leaflet | © OpenStreetMap contributors"
        >
            <TileLayer
                attribution=''
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Маркер для Ярославля (синий) */}
            <Marker position={yaroslavlPosition} icon={blueIcon}>
                <Popup>
                    <strong>📍 Склад в Ярославле</strong><br />
                    г. Ярославль, 2ая портовая улица (Речной порт)<br />
                    <strong>Режим работы:</strong> 9:00 - 17:00
                </Popup>
            </Marker>
            
            {/* Маркер для Лосино-Петровского (зеленый) */}
            <Marker position={losinoPosition} icon={greenIcon}>
                <Popup>
                    <strong>📍 Склад в Лосино-Петровском</strong><br />
                    г. Лосино-Петровский, р.п. Свердловский,<br />
                    ул. Промышленная (тер. Аграрная), строение 5, корпус 4<br />
                    <strong>Режим работы:</strong> 9:00 - 17:00
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapComponent;