import { Service, Employee, Appointment, AppSettings } from '../types';
import { INITIAL_SERVICES, INITIAL_EMPLOYEES, INITIAL_APPOINTMENTS, INITIAL_SETTINGS } from '../data/initialData';

// Helper to simulate async operations
const simulateLatency = <T,>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(data), 250));

// Generic function to get data from localStorage or initialize it
const getData = <T,>(key: string, initialData: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialData;
    } catch (error) {
        console.error(`Error reading ${key} from localStorage`, error);
        return initialData;
    }
};

// Generic function to save data to localStorage
const saveData = <T,>(key: string, data: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage`, error);
    }
};

// Initialize data if it doesn't exist
const initializeData = () => {
    if (!localStorage.getItem('app_services')) {
        saveData('app_services', INITIAL_SERVICES);
    }
    if (!localStorage.getItem('app_employees')) {
        saveData('app_employees', INITIAL_EMPLOYEES);
    }
    if (!localStorage.getItem('app_appointments')) {
        saveData('app_appointments', INITIAL_APPOINTMENTS);
    }
    if (!localStorage.getItem('app_settings')) {
        saveData('app_settings', INITIAL_SETTINGS);
    }
};

initializeData();

// --- Services API ---
export const getServices = async (): Promise<Service[]> => {
    const services = getData<Service[]>('app_services', INITIAL_SERVICES);
    return simulateLatency(services);
};

export const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    const services = await getServices();
    const newService: Service = { ...serviceData, id: Date.now().toString() };
    const updatedServices = [...services, newService];
    saveData('app_services', updatedServices);
    return simulateLatency(newService);
};

export const updateService = async (serviceData: Service): Promise<Service> => {
    const services = await getServices();
    const updatedServices = services.map(s => s.id === serviceData.id ? serviceData : s);
    saveData('app_services', updatedServices);
    return simulateLatency(serviceData);
};

export const deleteService = async (id: string): Promise<void> => {
    const services = await getServices();
    const updatedServices = services.filter(s => s.id !== id);
    saveData('app_services', updatedServices);
    return simulateLatency(undefined);
};

// --- Employees API ---
export const getEmployees = async (): Promise<Employee[]> => {
    const employees = getData<Employee[]>('app_employees', INITIAL_EMPLOYEES);
    return simulateLatency(employees);
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const employees = await getEmployees();
    const newEmployee: Employee = { ...employeeData, id: Date.now().toString() };
    const updatedEmployees = [...employees, newEmployee];
    saveData('app_employees', updatedEmployees);
    return simulateLatency(newEmployee);
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
    const employees = await getEmployees();
    const updatedEmployees = employees.map(e => e.id === employeeData.id ? employeeData : e);
    saveData('app_employees', updatedEmployees);
    return simulateLatency(employeeData);
};

export const deleteEmployee = async (id: string): Promise<void> => {
    const employees = await getEmployees();
    const updatedEmployees = employees.filter(e => e.id !== id);
    saveData('app_employees', updatedEmployees);
    return simulateLatency(undefined);
};

// --- Appointments API ---
export const getAppointments = async (): Promise<Appointment[]> => {
    const appointments = getData<Appointment[]>('app_appointments', INITIAL_APPOINTMENTS);
    return simulateLatency(appointments);
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const appointments = await getAppointments();
    const newAppointment: Appointment = { ...appointmentData, id: Date.now().toString() };
    const updatedAppointments = [...appointments, newAppointment];
    saveData('app_appointments', updatedAppointments);
    return simulateLatency(newAppointment);
};

export const updateAppointment = async (appointmentData: Appointment): Promise<Appointment> => {
    const appointments = await getAppointments();
    const updatedAppointments = appointments.map(a => a.id === appointmentData.id ? appointmentData : a);
    saveData('app_appointments', updatedAppointments);
    return simulateLatency(appointmentData);
};

export const deleteAppointment = async (id: string): Promise<void> => {
    const appointments = await getAppointments();
    const updatedAppointments = appointments.filter(a => a.id !== id);
    saveData('app_appointments', updatedAppointments);
    return simulateLatency(undefined);
};

// --- Settings API ---
export const getSettings = async (): Promise<AppSettings> => {
    const settings = getData<AppSettings>('app_settings', INITIAL_SETTINGS);
    return simulateLatency(settings);
};

export const updateSettings = async (settingsData: AppSettings): Promise<AppSettings> => {
    saveData('app_settings', settingsData);
    return simulateLatency(settingsData);
};
