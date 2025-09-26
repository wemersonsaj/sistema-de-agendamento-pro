import React, { useState, useEffect, createContext, useContext } from 'react';
import { Service, Employee, Appointment, AppSettings, AppContextType } from '../types';
import * as api from '../lib/api';

export const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [servicesData, employeesData, appointmentsData, settingsData] = await Promise.all([
                    api.getServices(),
                    api.getEmployees(),
                    api.getAppointments(),
                    api.getSettings(),
                ]);
                setServices(servicesData);
                setEmployees(employeesData);
                setAppointments(appointmentsData);
                setSettings(settingsData);
            } catch (error) {
                console.error("Failed to load initial data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);
    
    const addService = async (data: Omit<Service, 'id'>) => {
        const newService = await api.addService(data);
        setServices(prev => [...prev, newService]);
    };
    const updateService = async (data: Service) => {
        const updatedService = await api.updateService(data);
        setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
    };
    const deleteService = async (id: string) => {
        await api.deleteService(id);
        setServices(prev => prev.filter(s => s.id !== id));
    };
    
    const addEmployee = async (data: Omit<Employee, 'id'>) => {
        const newEmployee = await api.addEmployee(data);
        setEmployees(prev => [...prev, newEmployee]);
    };
    const updateEmployee = async (data: Employee) => {
        const updatedEmployee = await api.updateEmployee(data);
        setEmployees(prev => prev.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
    };
    const deleteEmployee = async (id: string) => {
        await api.deleteEmployee(id);
        setEmployees(prev => prev.filter(e => e.id !== id));
    };
    
    const addAppointment = async (data: Omit<Appointment, 'id'>) => {
        const newAppointment = await api.addAppointment(data);
        setAppointments(prev => [...prev, newAppointment]);
        return newAppointment;
    };
    const updateAppointment = async (data: Appointment) => {
        const updatedAppointment = await api.updateAppointment(data);
        setAppointments(prev => prev.map(a => a.id === updatedAppointment.id ? updatedAppointment : a));
    };
    const deleteAppointment = async (id: string) => {
        await api.deleteAppointment(id);
        setAppointments(prev => prev.filter(a => a.id !== id));
    };
    
    const updateSettings = async (data: AppSettings) => {
        const updatedSettings = await api.updateSettings(data);
        setSettings(updatedSettings);
    };

    const contextValue: AppContextType = {
        services,
        employees,
        appointments,
        settings,
        loading,
        addService,
        updateService,
        deleteService,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        updateSettings
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};