import { Service, Employee, Appointment, AppSettings } from '../types';

export const INITIAL_SERVICES: Service[] = [
  { id: '1', name: 'Corte de Cabelo', description: 'Corte moderno e estilizado.', duration: 30, price: 50.00 },
  { id: '2', name: 'Barba', description: 'Modelagem e aparo da barba.', duration: 30, price: 35.00 },
  { id: '3', name: 'Corte e Barba', description: 'Pacote completo para um visual impecável.', duration: 60, price: 80.00 },
  { id: '4', name: 'Hidratação Capilar', description: 'Tratamento para fortalecer os fios.', duration: 45, price: 60.00 },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: '1', name: 'João Silva', serviceIds: ['1', '3'] },
  { id: '2', name: 'Carlos Pereira', serviceIds: ['1', '2', '3', '4'] },
  { id: '3', name: 'Mariana Costa', serviceIds: ['1', '4'] },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_SETTINGS: AppSettings = {
  businessHours: {
    sun: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: false },
    mon: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: true },
    tue: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: true },
    wed: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: true },
    thu: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: true },
    fri: { start: '09:00', end: '18:00', lunchStart: '12:00', lunchEnd: '13:00', enabled: true },
    sat: { start: '09:00', end: '14:00', lunchStart: '12:00', lunchEnd: '12:00', enabled: true },
  },
  socials: {
    whatsapp: 'https://wa.me/5511999999999',
    instagram: 'https://instagram.com/seunegocio',
    address: 'Rua das Flores, 123, São Paulo - SP',
  },
  visuals: {
    logo: '',
    companyName: 'Barbearia Premium',
    primaryColor: '#c026d3', // fuchsia-700
  },
  goal: null,
};