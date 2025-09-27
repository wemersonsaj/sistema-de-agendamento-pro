import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Service, Employee, Appointment, AppSettings, AppContextType, GoalSettings } from './types';
import * as api from './lib/api';
import { WhatsAppIcon, InstagramIcon, TrashIcon, PencilIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XIcon, MapPinIcon, ClipboardListIcon, CogIcon, UsersIcon, ChartBarIcon, UserPlusIcon, DollarSignIcon } from './components/icons';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import ProtectedRoute from './src/components/ProtectedRoute';
import Login from './src/pages/Login';
import { supabase } from '@/src/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// --- App Context (Data) ---
const AppContext = React.createContext<AppContextType | null>(null);

const useAppContext = () => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [services, setServices] = React.useState<Service[]>([]);
    const [employees, setEmployees] = React.useState<Employee[]>([]);
    const [appointments, setAppointments] = React.useState<Appointment[]>([]);
    const [settings, setSettings] = React.useState<AppSettings | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
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
        services, employees, appointments, settings, loading,
        addService, updateService, deleteService,
        addEmployee, updateEmployee, deleteEmployee,
        addAppointment, updateAppointment, deleteAppointment,
        updateSettings
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

// --- MODAL COMPONENT ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="rounded-lg shadow-xl w-full max-w-lg bg-white text-gray-900">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition-opacity">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// --- CUSTOMER VIEW (INDEX PAGE) ---
const CustomerView: React.FC = () => {
    const { services, employees, appointments, settings, addAppointment } = useAppContext();
    const [step, setStep] = React.useState(1);
    const [customerName, setCustomerName] = React.useState('');
    const [customerWhatsapp, setCustomerWhatsapp] = React.useState('');
    const [selectedServiceId, setSelectedServiceId] = React.useState<string | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(new Date());
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = React.useState(false);
    const [lastAppointment, setLastAppointment] = React.useState<Appointment | null>(null);
    const [isBooking, setIsBooking] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = React.useState(new Date().getFullYear());

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEmployeeId(e.target.value);
        setSelectedServiceId(null);
        setSelectedTime(null);
        setStep(2);
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedServiceId(e.target.value);
        setSelectedTime(null);
        setStep(3);
    };

    const handleDateSelect = (day: number) => {
        const newDate = new Date(currentYear, currentMonth, day);
        if (isDayAvailable(newDate)) {
            setSelectedDate(newDate);
            setSelectedTime(null);
        }
    };
    
    const isDayAvailable = React.useCallback((date: Date): boolean => {
        if (!settings) return false;
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()] as keyof typeof settings.businessHours;
        const today = new Date();
        today.setHours(0,0,0,0);
        return settings.businessHours[dayOfWeek].enabled && date >= today;
    }, [settings]);

    const availableServices = React.useMemo(() => {
        if (!selectedEmployeeId) return [];
        const employee = employees.find(emp => emp.id === selectedEmployeeId);
        if (!employee) return [];
        return services.filter(service => employee.serviceIds.includes(service.id));
    }, [selectedEmployeeId, employees, services]);

    const availableTimeSlots = React.useMemo(() => {
        if (!selectedDate || !selectedServiceId || !selectedEmployeeId || !settings) return [];
        const dayOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][selectedDate.getDay()] as keyof typeof settings.businessHours;
        const daySettings = settings.businessHours[dayOfWeek];
        if (!daySettings.enabled) return [];
        const service = services.find(s => s.id === selectedServiceId);
        if (!service) return [];
        const slots = [];
        const serviceDuration = service.duration;
        const dayStart = new Date(`${selectedDate.toISOString().split('T')[0]}T${daySettings.start}`);
        const dayEnd = new Date(`${selectedDate.toISOString().split('T')[0]}T${daySettings.end}`);
        const lunchStart = new Date(`${selectedDate.toISOString().split('T')[0]}T${daySettings.lunchStart}`);
        const lunchEnd = new Date(`${selectedDate.toISOString().split('T')[0]}T${daySettings.lunchEnd}`);
        const employeeAppointments = appointments.filter(apt => apt.employeeId === selectedEmployeeId && apt.date === selectedDate.toISOString().split('T')[0]);
        let currentTime = dayStart;
        while (currentTime.getTime() + serviceDuration * 60000 <= dayEnd.getTime()) {
            const slotStart = new Date(currentTime);
            const slotEnd = new Date(slotStart.getTime() + serviceDuration * 60000);
            const isDuringLunch = (slotStart < lunchEnd && slotEnd > lunchStart);
            const isBooked = employeeAppointments.some(apt => {
                const aptService = services.find(s => s.id === apt.serviceId);
                if (!aptService) return false;
                const aptStart = new Date(`${apt.date}T${apt.time}`);
                const aptEnd = new Date(aptStart.getTime() + aptService.duration * 60000);
                return (slotStart < aptEnd && slotEnd > aptStart);
            });
            const isPast = new Date() > slotStart;
            if (!isDuringLunch && !isBooked && !isPast) {
                slots.push(slotStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
            }
            currentTime.setMinutes(currentTime.getMinutes() + 15);
        }
        return slots;
    }, [selectedDate, selectedServiceId, selectedEmployeeId, appointments, services, settings]);

    const confirmAppointment = async () => {
        if (!customerName || !customerWhatsapp || !selectedServiceId || !selectedEmployeeId || !selectedDate || !selectedTime) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const formattedDate = selectedDate.toISOString().split('T')[0];
        const cleanWhatsapp = customerWhatsapp.replace(/\D/g, '');

        const existingAppointment = appointments.find(apt => 
            apt.date === formattedDate && 
            apt.customerWhatsapp.replace(/\D/g, '') === cleanWhatsapp
        );

        if (existingAppointment) {
            alert('Você já possui um agendamento para este dia. Só é permitido um agendamento por dia por cliente. Para agendar um novo horário, por favor escolha uma data futura.');
            return;
        }

        setIsBooking(true);
        try {
            const appointmentData = { customerName, customerWhatsapp, serviceId: selectedServiceId, employeeId: selectedEmployeeId, date: formattedDate, time: selectedTime };
            const newAppointment = await addAppointment(appointmentData);
            setLastAppointment(newAppointment);
            setConfirmationModalOpen(true);
            setStep(1); setCustomerName(''); setCustomerWhatsapp(''); setSelectedServiceId(null); setSelectedEmployeeId(null); setSelectedDate(new Date()); setSelectedTime(null);
        } catch (error) {
            console.error("Failed to confirm appointment:", error);
            alert("Ocorreu um erro ao agendar. Tente novamente.");
        } finally {
            setIsBooking(false);
        }
    };

    const renderCalendar = () => {
        const date = new Date(currentYear, currentMonth, 1);
        const firstDay = date.getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const weeks: (number | null)[][] = [];
        let week: (number | null)[] = Array(firstDay).fill(null);
        for (let day = 1; day <= daysInMonth; day++) {
            week.push(day);
            if (week.length === 7) { weeks.push(week); week = []; }
        }
        if (week.length > 0) { week.push(...Array(7 - week.length).fill(null)); weeks.push(week); }
        const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
        return (
            <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                    <button onClick={() => { const newDate = new Date(currentYear, currentMonth - 1); setCurrentMonth(newDate.getMonth()); setCurrentYear(newDate.getFullYear()); }}><ChevronLeftIcon className="w-6 h-6" /></button>
                    <span className="font-bold text-lg capitalize">{monthName}</span>
                    <button onClick={() => { const newDate = new Date(currentYear, currentMonth + 1); setCurrentMonth(newDate.getMonth()); setCurrentYear(newDate.getFullYear()); }}><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => <div key={i} className="font-semibold text-sm text-gray-600">{day}</div>)}
                    {weeks.flat().map((day, i) => {
                        const dayDate = day ? new Date(currentYear, currentMonth, day) : null;
                        const isToday = dayDate && dayDate.toDateString() === new Date().toDateString();
                        const isSelected = dayDate && selectedDate && dayDate.toDateString() === selectedDate.toDateString();
                        const isAvailable = dayDate && isDayAvailable(dayDate);
                        let dayClasses = "p-2 rounded-full cursor-pointer transition-colors";
                        if (day === null) dayClasses = "p-2";
                        else if (isSelected) dayClasses += ` text-white bg-[${settings?.visuals.primaryColor}]`;
                        else if (isToday) dayClasses += " border border-gray-400";
                        else if (isAvailable) dayClasses += ` hover:bg-gray-200`;
                        else dayClasses += " text-gray-400 cursor-not-allowed";
                        return <div key={i} onClick={() => day && handleDateSelect(day)} className={dayClasses}>{day}</div>;
                    })}
                </div>
            </div>
        );
    };

    const renderConfirmationModal = () => {
        if (!lastAppointment || !settings) return null;
        const service = services.find(s => s.id === lastAppointment.serviceId);
        const employee = employees.find(e => e.id === lastAppointment.employeeId);
        const date = new Date(`${lastAppointment.date}T00:00:00`).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return (
            <Modal isOpen={isConfirmationModalOpen} onClose={() => setConfirmationModalOpen(false)} title="Agendamento Confirmado!">
                <div className="space-y-4">
                    <div className="text-center">
                        <span style={{ color: settings.visuals.primaryColor }}><CheckCircleIcon className="w-16 h-16 mx-auto"/></span>
                        <h2 className="text-2xl font-bold mt-2">Obrigado, {lastAppointment.customerName}!</h2>
                        <p className="text-gray-600">Seu horário foi confirmado com sucesso.</p>
                    </div>
                    <div className="border-t border-b border-gray-200 py-4 space-y-2">
                        <p><strong>Serviço:</strong> {service?.name}</p>
                        <p><strong>Profissional:</strong> {employee?.name}</p>
                        <p><strong>Data:</strong> <span className="capitalize">{date}</span></p>
                        <p><strong>Horário:</strong> {lastAppointment.time}</p>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-700">
                        <span style={{ color: settings.visuals.primaryColor }}><MapPinIcon className="w-5 h-5 mt-1 flex-shrink-0" /></span>
                        <p>{settings.socials.address}</p>
                    </div>
                    <div className="flex justify-center space-x-4 pt-4">
                        <a href={settings.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="text-gray-500 transition-colors" onMouseOver={e => e.currentTarget.style.color = settings.visuals.primaryColor} onMouseOut={e => e.currentTarget.style.color = ''}><WhatsAppIcon className="w-10 h-10" /></a>
                        <a href={settings.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 transition-colors" onMouseOver={e => e.currentTarget.style.color = settings.visuals.primaryColor} onMouseOut={e => e.currentTarget.style.color = ''}><InstagramIcon className="w-10 h-10" /></a>
                    </div>
                </div>
            </Modal>
        );
    };
    
    if (!settings) return null;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-4xl font-bold text-center mb-2" style={{ color: settings.visuals.primaryColor }}>Agende seu Horário</h1>
            <p className="text-center text-lg text-gray-600 mb-8">Simples, rápido e fácil.</p>
            <div className="space-y-6">
                <div className={`p-6 rounded-lg shadow-lg border border-gray-200 bg-white transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><span className="flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white" style={{ backgroundColor: settings.visuals.primaryColor }}>1</span>Informações e Profissional</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Seu nome" className="w-full p-3 rounded bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2" style={{'--tw-ring-color': settings.visuals.primaryColor} as React.CSSProperties}/>
                        <input type="text" value={customerWhatsapp} onChange={e => setCustomerWhatsapp(e.target.value)} placeholder="Seu WhatsApp" className="w-full p-3 rounded bg-gray-50 border border-gray-300 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2" style={{'--tw-ring-color': settings.visuals.primaryColor} as React.CSSProperties}/>
                    </div>
                    <select value={selectedEmployeeId || ''} onChange={handleEmployeeChange} className="mt-4 w-full p-3 rounded bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2" style={{'--tw-ring-color': settings.visuals.primaryColor} as React.CSSProperties} disabled={!customerName || !customerWhatsapp}>
                        <option value="">Selecione um profissional</option>
                        {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                    </select>
                </div>
                {step >= 2 && (
                <div className={`p-6 rounded-lg shadow-lg border border-gray-200 bg-white transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><span className="flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white" style={{ backgroundColor: settings.visuals.primaryColor }}>2</span>Serviço</h2>
                    <select value={selectedServiceId || ''} onChange={handleServiceChange} className="w-full p-3 rounded bg-gray-50 border border-gray-300 text-gray-900 focus:outline-none focus:ring-2" style={{'--tw-ring-color': settings.visuals.primaryColor} as React.CSSProperties}>
                        <option value="">Selecione um serviço</option>
                        {availableServices.map(s => <option key={s.id} value={s.id}>{s.name} - R${s.price.toFixed(2)}</option>)}
                    </select>
                </div>
                )}
                {step >= 3 && (
                <div className={`p-6 rounded-lg shadow-lg border border-gray-200 bg-white transition-all duration-500 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><span className="flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white" style={{ backgroundColor: settings.visuals.primaryColor }}>3</span>Data e Hora</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                       {renderCalendar()}
                       <div>
                            <h3 className="font-bold text-lg text-center mb-2">Horários disponíveis</h3>
                            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                               {availableTimeSlots.length > 0 ? availableTimeSlots.map(time => (
                                    <button key={time} onClick={() => { setSelectedTime(time); setStep(4); }} className={`p-2 text-center rounded transition-colors ${selectedTime === time ? `text-white bg-[${settings.visuals.primaryColor}]` : `bg-gray-100 text-gray-900 hover:bg-gray-200`}`}>{time}</button>
                                )) : <p className="col-span-3 text-center text-gray-400 mt-4">Nenhum horário disponível.</p>}
                            </div>
                       </div>
                    </div>
                </div>
                )}
                {step >= 4 && selectedTime && (
                <div className={`p-6 rounded-lg shadow-lg border border-gray-200 bg-white transition-all duration-500`}>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center"><span className="flex items-center justify-center w-8 h-8 rounded-full mr-3 text-white" style={{ backgroundColor: settings.visuals.primaryColor }}>4</span>Confirmar</h2>
                    <div className="bg-gray-100 p-4 rounded-md space-y-1">
                        <p><strong>Serviço:</strong> {services.find(s => s.id === selectedServiceId)?.name}</p>
                        <p><strong>Profissional:</strong> {employees.find(e => e.id === selectedEmployeeId)?.name}</p>
                        <p><strong>Data:</strong> {selectedDate?.toLocaleDateString('pt-BR')}</p>
                        <p><strong>Hora:</strong> {selectedTime}</p>
                    </div>
                    <button onClick={confirmAppointment} disabled={isBooking} className={`w-full text-white font-bold py-3 px-4 rounded mt-4 transition-opacity hover:opacity-90 disabled:opacity-50`} style={{ backgroundColor: settings.visuals.primaryColor }}>
                        {isBooking ? 'Confirmando...' : 'Confirmar Agendamento'}
                    </button>
                </div>
                )}
            </div>
            {renderConfirmationModal()}
        </div>
    );
};

// --- ADMIN VIEW (ADMIN PAGE) ---
const AdminView = () => {
    type AdminTab = 'appointments' | 'schedule' | 'reports' | 'services' | 'employees' | 'admins' | 'goals' | 'settings';
    const [activeTab, setActiveTab] = React.useState<AdminTab>('appointments');
    const { services, employees, appointments, settings, deleteService, deleteEmployee, deleteAppointment, addService, updateService, addEmployee, updateEmployee, addAppointment, updateAppointment, updateSettings } = useAppContext();
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingItem, setEditingItem] = React.useState<any | null>(null);
    const [modalType, setModalType] = React.useState<'service' | 'employee' | 'appointment' | null>(null);
    const [reportFilter, setReportFilter] = React.useState({ startDate: '', endDate: '', employeeId: 'all', serviceId: 'all' });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
    const [reportData, setReportData] = React.useState<{ appointments: Appointment[], revenue: number } | null>(null);

    const handleOpenModal = (type: 'service' | 'employee' | 'appointment', item: any | null = null) => {
        setModalType(type);
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setModalType(null);
    };
    
    const handleDelete = async (type: 'service' | 'employee' | 'appointment', id: string) => {
        if (!window.confirm("Tem certeza que deseja excluir este item?")) return;
        try {
            switch(type) {
                case 'service': await deleteService(id); break;
                case 'employee': await deleteEmployee(id); break;
                case 'appointment': await deleteAppointment(id); break;
            }
        } catch (error) {
            console.error(`Failed to delete ${type}`, error);
            alert(`Ocorreu um erro ao excluir.`);
        }
    };

    const handleTabSelection = (tab: AdminTab) => {
        setActiveTab(tab);
        setIsMobileMenuOpen(false);
    };

    const handleGenerateReport = () => {
        let filtered = [...appointments];

        if (reportFilter.startDate && reportFilter.endDate) {
            const start = new Date(reportFilter.startDate + 'T00:00:00');
            const end = new Date(reportFilter.endDate + 'T23:59:59');
            filtered = filtered.filter(apt => {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                return aptDate >= start && aptDate <= end;
            });
        }

        if (reportFilter.employeeId !== 'all') {
            filtered = filtered.filter(apt => apt.employeeId === reportFilter.employeeId);
        }

        if (reportFilter.serviceId !== 'all') {
            filtered = filtered.filter(apt => apt.serviceId === reportFilter.serviceId);
        }

        const totalRevenue = filtered.reduce((acc, apt) => {
            const service = services.find(s => s.id === apt.serviceId);
            return acc + (service ? service.price : 0);
        }, 0);

        setReportData({ appointments: filtered, revenue: totalRevenue });
        setIsReportModalOpen(true);
    };

    const AdminModal: React.FC = () => {
        if (!modalType) return null;
        const [formData, setFormData] = React.useState(editingItem || {});
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        
        React.useEffect(() => {
            if (editingItem) setFormData(editingItem);
            else {
                switch (modalType) {
                    case 'service': setFormData({ name: '', description: '', duration: 30, price: 0 }); break;
                    case 'employee': setFormData({ name: '', serviceIds: [] }); break;
                    case 'appointment': setFormData({ customerName: '', customerWhatsapp: '', serviceId: '', employeeId: '', date: '', time: '' }); break;
                }
            }
        }, [editingItem, modalType]);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
        const handleEmployeeServiceChange = (serviceId: string) => {
            const currentIds = formData.serviceIds || [];
            if (currentIds.includes(serviceId)) setFormData({ ...formData, serviceIds: currentIds.filter((id: string) => id !== serviceId) });
            else setFormData({ ...formData, serviceIds: [...currentIds, serviceId] });
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            try {
                switch(modalType) {
                    case 'service': 
                        const serviceData = { ...formData, duration: Number(formData.duration), price: Number(formData.price) };
                        editingItem ? await updateService(serviceData) : await addService(serviceData);
                        break;
                    case 'employee':
                        editingItem ? await updateEmployee(formData) : await addEmployee(formData);
                        break;
                    case 'appointment':
                        editingItem ? await updateAppointment(formData) : await addAppointment(formData);
                        break;
                }
                handleCloseModal();
            } catch (error) {
                console.error("Failed to save data:", error);
                alert("Ocorreu um erro ao salvar os dados.");
            } finally {
                setIsSubmitting(false);
            }
        };
        
        const title = `${editingItem ? 'Editar' : 'Adicionar'} ${{service: 'Serviço', employee: 'Funcionário', appointment: 'Agendamento'}[modalType]}`;
        return (
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={title}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {modalType === 'service' && (<>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Serviço" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <textarea name="description" value={formData.description || ''} onChange={handleChange} placeholder="Descrição" className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <input name="duration" type="number" value={formData.duration || ''} onChange={handleChange} placeholder="Duração (minutos)" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <input name="price" type="number" step="0.01" value={formData.price || ''} onChange={handleChange} placeholder="Preço" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                    </>)}
                    {modalType === 'employee' && (<>
                        <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Nome do Funcionário" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <div>
                            <label className="block mb-2 font-semibold">Serviços Prestados:</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                                {services.map(s => (
                                    <label key={s.id} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                                        <input type="checkbox" checked={(formData.serviceIds || []).includes(s.id)} onChange={() => handleEmployeeServiceChange(s.id)} className="form-checkbox h-5 w-5" style={{ color: settings?.visuals.primaryColor }}/>
                                        <span>{s.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </>)}
                    {modalType === 'appointment' && (<>
                        <input name="customerName" value={formData.customerName || ''} onChange={handleChange} placeholder="Nome do Cliente" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <input name="customerWhatsapp" value={formData.customerWhatsapp || ''} onChange={handleChange} placeholder="WhatsApp do Cliente" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"/>
                        <select name="serviceId" value={formData.serviceId || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900">
                            <option value="">Selecione o Serviço</option>
                            {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <select name="employeeId" value={formData.employeeId || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900">
                            <option value="">Selecione o Funcionário</option>
                            {employees.filter(e => !formData.serviceId || e.serviceIds.includes(formData.serviceId)).map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <input name="date" type="date" value={formData.date || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                        <input name="time" type="time" value={formData.time || ''} onChange={handleChange} required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                    </>)}
                    <button type="submit" disabled={isSubmitting} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings?.visuals.primaryColor }}>{isSubmitting ? 'Salvando...' : 'Salvar'}</button>
                </form>
            </Modal>
        );
    };
    
    const SettingsComponent = () => {
        const [currentSettings, setCurrentSettings] = React.useState(settings);
        const [isSaving, setIsSaving] = React.useState(false);
        React.useEffect(() => { setCurrentSettings(settings); }, [settings]);
        if (!currentSettings) return null;
        const handleVisualChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentSettings(s => s ? ({...s, visuals: {...s.visuals, [e.target.name]: e.target.value }}) : null);
        const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentSettings(s => s ? ({...s, socials: {...s.socials, [e.target.name]: e.target.value }}) : null);
        const handleHoursChange = (day: keyof typeof settings.businessHours, field: keyof typeof settings.businessHours.sun, value: string | boolean) => setCurrentSettings(s => s ? ({ ...s, businessHours: { ...s.businessHours, [day]: { ...s.businessHours[day], [field]: value } } }) : null);
        const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setCurrentSettings(s => s ? ({...s, visuals: {...s.visuals, logo: reader.result as string }}) : null);
                reader.readAsDataURL(file);
            }
        };
        const saveSettings = async () => {
            if (!currentSettings) return;
            setIsSaving(true);
            try {
                await updateSettings(currentSettings);
                alert("Configurações salvas!");
            } catch (error) {
                console.error("Failed to save settings", error);
                alert("Ocorreu um erro ao salvar as configurações.");
            } finally {
                setIsSaving(false);
            }
        };
        const daysOfWeek = { sun: 'Domingo', mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta', fri: 'Sexta', sat: 'Sábado' };
        return (
            <div className="space-y-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4">Funcionamento</h3>
                    <div className="space-y-4">
                        {Object.keys(daysOfWeek).map(day => (
                            <div key={day} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-3 bg-gray-100 rounded-md">
                                <label className="font-semibold capitalize md:col-span-1 flex items-center">
                                     <input type="checkbox" checked={currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].enabled} onChange={(e) => handleHoursChange(day as any, 'enabled', e.target.checked)} className="mr-2 h-5 w-5" style={{ accentColor: settings?.visuals.primaryColor }} />
                                    {daysOfWeek[day as keyof typeof daysOfWeek]}
                                </label>
                                {currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].enabled && (<>
                                    <input type="time" value={currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].start} onChange={e => handleHoursChange(day as any, 'start', e.target.value)} className="p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                                    <input type="time" value={currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].end} onChange={e => handleHoursChange(day as any, 'end', e.target.value)} className="p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                                    <input type="time" value={currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].lunchStart} onChange={e => handleHoursChange(day as any, 'lunchStart', e.target.value)} className="p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                                    <input type="time" value={currentSettings.businessHours[day as keyof typeof currentSettings.businessHours].lunchEnd} onChange={e => handleHoursChange(day as any, 'lunchEnd', e.target.value)} className="p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                                </>)}
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Redes Sociais e Endereço</h3>
                    <div className="space-y-4">
                        <input name="whatsapp" value={currentSettings.socials.whatsapp} onChange={handleSocialChange} placeholder="Link do WhatsApp" className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                        <input name="instagram" value={currentSettings.socials.instagram} onChange={handleSocialChange} placeholder="Link do Instagram" className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                        <input name="address" value={currentSettings.socials.address} onChange={handleSocialChange} placeholder="Endereço Completo" className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4">Visual</h3>
                    <div className="space-y-4">
                        <input name="companyName" value={currentSettings.visuals.companyName} onChange={handleVisualChange} placeholder="Nome da Empresa" className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                        <div>
                            <label className="block mb-1">Logo da Empresa</label>
                            <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                             {currentSettings.visuals.logo && <img src={currentSettings.visuals.logo} alt="Logo" className="mt-2 h-16 w-auto bg-white p-1 rounded" />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center gap-2">Cor dos Botões: <input type="color" name="primaryColor" value={currentSettings.visuals.primaryColor} onChange={handleVisualChange} /></label>
                        </div>
                    </div>
                </div>
                <button onClick={saveSettings} disabled={isSaving} className="w-full text-white font-bold py-3 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings?.visuals.primaryColor }}>{isSaving ? 'Salvando...' : 'Salvar Configurações'}</button>
            </div>
        );
    };

    const AdminUsersComponent = () => {
        const { session } = useAuth();
        const [email, setEmail] = React.useState('');
        const [password, setPassword] = React.useState('');
        const [isSubmitting, setIsSubmitting] = React.useState(false);
        const [message, setMessage] = React.useState('');
        const [error, setError] = React.useState('');
        
        const [users, setUsers] = React.useState<User[]>([]);
        const [loadingUsers, setLoadingUsers] = React.useState(true);
        const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);
        const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
        const [newPassword, setNewPassword] = React.useState('');
        const [isUpdating, setIsUpdating] = React.useState(false);

        const fetchUsers = async () => {
            setLoadingUsers(true);
            setError('');
            try {
                const { data, error } = await supabase.functions.invoke('list-users');
                if (error) throw error;
                setUsers(data.users);
            } catch (err: any) {
                console.error("Error fetching users:", err);
                setError("Não foi possível carregar a lista de administradores.");
            } finally {
                setLoadingUsers(false);
            }
        };

        React.useEffect(() => {
            fetchUsers();
        }, []);

        const handleCreateUserSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setIsSubmitting(true);
            setMessage('');
            setError('');

            const { error } = await supabase.auth.signUp({ email, password });

            if (error) {
                setError(`Erro ao criar usuário: ${error.message}`);
            } else {
                setMessage(`Convite enviado para ${email}. O novo usuário precisa confirmar o email para poder acessar.`);
                setEmail('');
                setPassword('');
                fetchUsers(); // Refresh the list after adding a new user
            }
            setIsSubmitting(false);
        };

        const handleDeleteUser = async (userId: string) => {
            if (!window.confirm("Tem certeza que deseja excluir este administrador? Esta ação não pode ser desfeita.")) return;
            
            try {
                const { error } = await supabase.functions.invoke('manage-user', {
                    method: 'DELETE',
                    body: { userId }
                });
                if (error) throw error;
                alert("Administrador excluído com sucesso.");
                fetchUsers(); // Refresh list
            } catch (err: any) {
                console.error("Error deleting user:", err);
                alert(`Ocorreu um erro ao excluir o administrador: ${err.message}`);
            }
        };

        const openPasswordModal = (user: User) => {
            setSelectedUser(user);
            setNewPassword('');
            setIsPasswordModalOpen(true);
        };

        const handlePasswordChange = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!selectedUser || !newPassword) return;
            setIsUpdating(true);
            try {
                const { error } = await supabase.functions.invoke('manage-user', {
                    method: 'PUT',
                    body: { userId: selectedUser.id, password: newPassword }
                });
                if (error) throw error;
                alert("Senha alterada com sucesso.");
                setIsPasswordModalOpen(false);
                setSelectedUser(null);
            } catch (err: any) {
                console.error("Error updating password:", err);
                alert(`Ocorreu um erro ao alterar a senha: ${err.message}`);
            } finally {
                setIsUpdating(false);
            }
        };

        return (
            <div>
                <h3 className="text-xl font-semibold mb-4">Criar Novo Administrador</h3>
                <p className="mb-4 text-sm text-gray-600">
                    Isso criará um novo usuário e enviará um email de confirmação. O usuário precisará clicar no link do email para ativar a conta e poder acessar o painel.
                </p>
                <form onSubmit={handleCreateUserSubmit} className="space-y-4 max-w-md">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email do novo admin" required className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha (mínimo 6 caracteres)" required minLength={6} className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                    <button type="submit" disabled={isSubmitting} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings?.visuals.primaryColor }}>
                        {isSubmitting ? 'Enviando convite...' : 'Criar e Enviar Convite'}
                    </button>
                </form>
                {message && <p className="mt-4 text-sm text-green-600 bg-green-100 p-3 rounded">{message}</p>}
                
                <div className="mt-12">
                    <h3 className="text-xl font-semibold mb-4">Administradores Atuais</h3>
                    {error && <p className="my-4 text-sm text-red-600 bg-red-100 p-3 rounded">{error}</p>}
                    {loadingUsers ? <p>Carregando...</p> : (
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md">
                                    <div>
                                        <p className="font-semibold">{user.email}</p>
                                        <p className="text-sm text-gray-500">Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <button onClick={() => openPasswordModal(user)} className="text-blue-500 hover:text-blue-700 font-semibold text-sm">Alterar Senha</button>
                                        {session?.user.id !== user.id ? (
                                            <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 font-semibold text-sm">Excluir</button>
                                        ) : (
                                            <button disabled className="text-gray-400 cursor-not-allowed font-semibold text-sm">Excluir</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={`Alterar senha de ${selectedUser?.email}`}>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nova senha (mínimo 6 caracteres)" required minLength={6} className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900" />
                        <button type="submit" disabled={isUpdating} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings?.visuals.primaryColor }}>
                            {isUpdating ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </form>
                </Modal>
            </div>
        );
    };

    const GoalComponent = () => {
        const { settings, appointments, services, updateSettings } = useAppContext();
        const [newTarget, setNewTarget] = React.useState(1000);
        const [newDuration, setNewDuration] = React.useState(30);
        const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
        const [editingGoal, setEditingGoal] = React.useState<GoalSettings | null>(null);
        const [isSaving, setIsSaving] = React.useState(false);
    
        const handleSetGoal = async () => {
            if (!settings) return;
            setIsSaving(true);
            const today = new Date();
            const endDate = new Date();
            endDate.setDate(today.getDate() + newDuration);
    
            const newGoalData = {
                target: Number(newTarget),
                startDate: today.toISOString().split('T')[0],
                endDate: endDate.toISOString().split('T')[0],
            };
    
            try {
                await updateSettings({ ...settings, goal: newGoalData });
                alert("Meta definida com sucesso!");
            } catch (error) {
                console.error("Failed to set goal", error);
                alert("Erro ao definir a meta.");
            } finally {
                setIsSaving(false);
            }
        };
    
        const handleClearGoal = async () => {
            if (!settings || !window.confirm("Tem certeza que deseja apagar a meta atual?")) return;
            setIsSaving(true);
            try {
                await updateSettings({ ...settings, goal: null });
            } catch (error) {
                console.error("Failed to clear goal", error);
                alert("Erro ao apagar a meta.");
            } finally {
                setIsSaving(false);
            }
        };

        const handleOpenEditModal = () => {
            if (settings?.goal) {
                setEditingGoal({ ...settings.goal });
                setIsEditModalOpen(true);
            }
        };

        const handleCloseEditModal = () => {
            setIsEditModalOpen(false);
            setEditingGoal(null);
        };

        const handleUpdateGoal = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!settings || !editingGoal) return;
            setIsSaving(true);
            try {
                await updateSettings({ ...settings, goal: editingGoal });
                alert("Meta atualizada com sucesso!");
                handleCloseEditModal();
            } catch (error) {
                console.error("Failed to update goal", error);
                alert("Erro ao atualizar a meta.");
            } finally {
                setIsSaving(false);
            }
        };
    
        const { currentRevenue, daysRemaining, progressPercentage, totalDuration } = React.useMemo(() => {
            if (!settings?.goal) {
                return { currentRevenue: 0, daysRemaining: 0, progressPercentage: 0, totalDuration: 0 };
            }
    
            const goalStartDate = new Date(settings.goal.startDate + 'T00:00:00');
            const goalEndDate = new Date(settings.goal.endDate + 'T00:00:00');
    
            const relevantAppointments = appointments.filter(apt => {
                const aptDate = new Date(`${apt.date}T${apt.time}`);
                const goalEndDateForFilter = new Date(settings.goal!.endDate + 'T23:59:59');
                return aptDate >= goalStartDate && aptDate <= goalEndDateForFilter;
            });
    
            const revenue = relevantAppointments.reduce((acc, apt) => {
                const service = services.find(s => s.id === apt.serviceId);
                return acc + (service ? service.price : 0);
            }, 0);
    
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const goalEndDateForRemaining = new Date(settings.goal.endDate + 'T23:59:59');
            const remaining = Math.max(0, Math.ceil((goalEndDateForRemaining.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
            
            const durationInMs = goalEndDate.getTime() - goalStartDate.getTime();
            const total = Math.round(durationInMs / (1000 * 60 * 60 * 24)) + 1;
    
            const percentage = settings.goal.target > 0 ? (revenue / settings.goal.target) * 100 : 0;
    
            return {
                currentRevenue: revenue,
                daysRemaining: remaining,
                progressPercentage: Math.min(100, percentage),
                totalDuration: total,
            };
        }, [settings?.goal, appointments, services]);
    
        if (!settings) return null;
    
        const renderActiveGoal = () => (
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-semibold">Progresso da Meta</h3>
                        <span className="text-sm font-medium text-gray-500">
                            Meta de {totalDuration} dia{totalDuration > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-base font-medium text-gray-700">Alcançado</span>
                        <span className="text-sm font-medium text-gray-700">R$ {currentRevenue.toFixed(2)} / R$ {settings.goal!.target.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                        <div className="h-4 rounded-full" style={{ width: `${progressPercentage}%`, backgroundColor: settings.visuals.primaryColor }}></div>
                    </div>
                    <p className="text-right text-sm text-gray-600 mt-2">{daysRemaining} dias restantes</p>
                </div>
                <div className="flex space-x-4">
                    <button onClick={handleOpenEditModal} disabled={isSaving} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings.visuals.primaryColor }}>
                        Editar Meta
                    </button>
                    <button onClick={handleClearGoal} disabled={isSaving} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50">
                        {isSaving ? 'Apagando...' : 'Apagar Meta'}
                    </button>
                </div>
            </div>
        );

        const renderNewGoalForm = () => (
            <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-2">Definir Nova Meta de Receita</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor da Meta (R$)</label>
                    <input type="number" value={newTarget} onChange={e => setNewTarget(Number(e.target.value))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Prazo para alcançar (em dias)</label>
                    <input type="number" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900" />
                </div>
                <button onClick={handleSetGoal} disabled={isSaving} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings.visuals.primaryColor }}>
                    {isSaving ? 'Salvando...' : 'Salvar Meta'}
                </button>
            </div>
        );

        const renderEditModal = () => (
            <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal} title="Editar Meta">
                {editingGoal && (
                    <form onSubmit={handleUpdateGoal} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Valor da Meta (R$)</label>
                            <input 
                                type="number" 
                                value={editingGoal.target} 
                                onChange={e => setEditingGoal(g => g ? {...g, target: Number(e.target.value)} : null)}
                                className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Data Final</label>
                            <input 
                                type="date" 
                                value={editingGoal.endDate}
                                min={editingGoal.startDate}
                                onChange={e => setEditingGoal(g => g ? {...g, endDate: e.target.value} : null)}
                                className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900"
                                required
                            />
                        </div>
                        <p className="text-sm text-gray-500">Data de início: {new Date(editingGoal.startDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                        <button type="submit" disabled={isSaving} className="w-full text-white font-bold py-2 px-4 rounded disabled:opacity-50" style={{ backgroundColor: settings?.visuals.primaryColor }}>
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </form>
                )}
            </Modal>
        );
    
        return (
            <>
                {settings.goal ? renderActiveGoal() : renderNewGoalForm()}
                {renderEditModal()}
            </>
        );
    };

    const sortedAppointments = React.useMemo(() => [...appointments].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()), [appointments]);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'appointments':
                return (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-300"><tr><th className="p-2">Cliente</th><th className="p-2">Data/Hora</th><th className="p-2">Serviço</th><th className="p-2">Profissional</th><th className="p-2">Ações</th></tr></thead>
                            <tbody>
                                {sortedAppointments.map(apt => (
                                    <tr key={apt.id} className="border-b border-gray-200">
                                        <td className="p-2">{apt.customerName}</td>
                                        <td className="p-2">{new Date(`${apt.date}T${apt.time}`).toLocaleString('pt-BR')}</td>
                                        <td className="p-2">{services.find(s => s.id === apt.serviceId)?.name || 'N/A'}</td>
                                        <td className="p-2">{employees.find(e => e.id === apt.employeeId)?.name || 'N/A'}</td>
                                        <td className="p-2 flex space-x-2">
                                            <a href={`https://wa.me/${apt.customerWhatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-700"><WhatsAppIcon className="w-5 h-5"/></a>
                                            <button onClick={() => handleOpenModal('appointment', apt)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDelete('appointment', apt.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );
            case 'reports':
                return (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-100 rounded">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">De:</label>
                                <input type="date" value={reportFilter.startDate} onChange={e => setReportFilter(f => ({...f, startDate: e.target.value}))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Até:</label>
                                <input type="date" value={reportFilter.endDate} onChange={e => setReportFilter(f => ({...f, endDate: e.target.value}))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Funcionário:</label>
                                <select value={reportFilter.employeeId} onChange={e => setReportFilter(f => ({...f, employeeId: e.target.value}))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900">
                                    <option value="all">Todos</option>
                                    {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Serviço:</label>
                                <select value={reportFilter.serviceId} onChange={e => setReportFilter(f => ({...f, serviceId: e.target.value}))} className="mt-1 p-2 w-full rounded bg-white border border-gray-300 text-gray-900">
                                    <option value="all">Todos</option>
                                    {services.map(srv => <option key={srv.id} value={srv.id}>{srv.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <button onClick={handleGenerateReport} className="w-full text-white font-bold py-2 px-4 rounded" style={{ backgroundColor: settings?.visuals.primaryColor }}>Gerar Relatório</button>
                    </div>
                );
            case 'schedule': return <CustomerView />;
            case 'services': return (<div className="space-y-4">{services.map(s => (<div key={s.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md"><div><p className="font-bold">{s.name} (R${s.price.toFixed(2)})</p><p className="text-sm text-gray-500">{s.description} - {s.duration} min</p></div><div className="flex space-x-2"><button onClick={() => handleOpenModal('service', s)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="w-5 h-5"/></button><button onClick={() => handleDelete('service', s.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button></div></div>))}</div>);
            case 'employees': return (<div className="space-y-4">{employees.map(e => (<div key={e.id} className="flex justify-between items-center p-3 bg-gray-100 rounded-md"><div><p className="font-bold">{e.name}</p><p className="text-sm text-gray-500">{e.serviceIds.map(id => services.find(s => s.id === id)?.name).join(', ')}</p></div><div className="flex space-x-2"><button onClick={() => handleOpenModal('employee', e)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="w-5 h-5"/></button><button onClick={() => handleDelete('employee', e.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button></div></div>))}</div>);
            case 'admins': return <AdminUsersComponent />;
            case 'goals': return <GoalComponent />;
            case 'settings': return <SettingsComponent />;
            default: return null;
        }
    };
    
    if (!settings) return null;

    const tabs = [
        { id: 'appointments', label: 'Agendamentos', icon: <ClipboardListIcon className="w-5 h-5 mr-2" /> },
        { id: 'schedule', label: 'Agendar', icon: <PlusIcon className="w-5 h-5 mr-2" /> },
        { id: 'reports', label: 'Relatórios', icon: <ChartBarIcon className="w-5 h-5 mr-2" /> },
        { id: 'services', label: 'Serviços', icon: <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg> },
        { id: 'employees', label: 'Funcionários', icon: <UsersIcon className="w-5 h-5 mr-2" /> },
        { id: 'admins', label: 'Administradores', icon: <UserPlusIcon className="w-5 h-5 mr-2" /> },
        { id: 'goals', label: 'Metas', icon: <DollarSignIcon className="w-5 h-5 mr-2" /> },
        { id: 'settings', label: 'Configurações', icon: <CogIcon className="w-5 h-5 mr-2" /> },
    ];
    
    const getTabTitle = () => tabs.find(t => t.id === activeTab)?.label || 'Admin';
    const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
    );

    const ReportModal = () => {
        if (!isReportModalOpen || !reportData) return null;
    
        return (
            <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Relatório de Agendamentos">
                <div className="space-y-4" id="printable-report">
                    <div className="p-4 bg-gray-100 rounded-lg">
                        <h4 className="text-lg font-bold">Total de Atendimentos: <span className="font-normal">{reportData.appointments.length}</span></h4>
                        <h4 className="text-lg font-bold">Receita Total: <span className="font-normal">R$ {reportData.revenue.toFixed(2).replace('.', ',')}</span></h4>
                    </div>
                    <div className="max-h-80 overflow-y-auto border rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-2 font-semibold">Cliente</th>
                                    <th className="p-2 font-semibold">Data</th>
                                    <th className="p-2 font-semibold">Serviço</th>
                                    <th className="p-2 font-semibold">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {reportData.appointments.length > 0 ? reportData.appointments.map(apt => {
                                    const service = services.find(s => s.id === apt.serviceId);
                                    return (
                                        <tr key={apt.id}>
                                            <td className="p-2">{apt.customerName}</td>
                                            <td className="p-2">{new Date(`${apt.date}T${apt.time}`).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="p-2">{service?.name || 'N/A'}</td>
                                            <td className="p-2">R$ {service ? service.price.toFixed(2).replace('.', ',') : '0,00'}</td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-gray-500">Nenhum agendamento encontrado para os filtros selecionados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
                <button className="md:hidden p-2 rounded-md hover:bg-gray-100" onClick={() => setIsMobileMenuOpen(true)}>
                    <MenuIcon className="w-6 h-6 text-gray-800" />
                </button>
            </div>
            <div className="flex flex-col md:flex-row gap-8">
                {isMobileMenuOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
                <aside className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out md:relative md:w-1/4 lg:w-1/5 md:transform-none md:bg-transparent md:shadow-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="p-4 flex justify-between items-center md:hidden border-b border-gray-200">
                        <h2 className="font-bold text-lg" style={{ color: settings?.visuals.primaryColor }}>Menu</h2>
                        <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                            <XIcon className="w-6 h-6 text-gray-800" />
                        </button>
                    </div>
                    <nav className="flex flex-col p-4 md:p-0 space-y-2">
                        {tabs.map(tab => (
                             <button key={tab.id} onClick={() => handleTabSelection(tab.id as AdminTab)} className={`flex items-center text-left p-3 rounded-md transition-colors w-full whitespace-nowrap ${activeTab === tab.id ? `text-white shadow` : 'text-gray-700 hover:bg-gray-100'}`} style={{ backgroundColor: activeTab === tab.id ? settings.visuals.primaryColor : 'transparent' }}>{tab.icon} {tab.label}</button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">{getTabTitle()}</h2>
                        {['services', 'employees', 'appointments'].includes(activeTab) && (
                            <button onClick={() => handleOpenModal(activeTab.slice(0, -1) as any, null)} className="flex items-center text-white font-bold py-2 px-4 rounded shadow" style={{ backgroundColor: settings.visuals.primaryColor }}><PlusIcon className="w-5 h-5 mr-1"/> Adicionar</button>
                        )}
                    </div>
                    <div className="p-6 rounded-lg shadow-lg border border-gray-200 bg-white">{renderTabContent()}</div>
                </main>
            </div>
            <AdminModal />
            <ReportModal />
        </div>
    );
};

// --- LAYOUT COMPONENT ---
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { settings, loading } = useAppContext();
    const { session, signOut } = useAuth();
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    React.useEffect(() => {
        document.body.style.backgroundColor = isLoginPage ? '#f9fafb' : '#FFFFFF';
        document.body.style.color = '#1f2937';
    }, [isLoginPage]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen"><div className="text-xl font-semibold">Carregando...</div></div>;
    }
    if (!settings && !isLoginPage) {
        return <div className="flex justify-center items-center min-h-screen"><div className="text-xl font-semibold text-red-500">Erro ao carregar as configurações.</div></div>;
    }

    return (
        <div className="min-h-screen">
            {!isLoginPage && settings && (
                <header className="py-4 px-4 sm:px-8 flex justify-between items-center border-b border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3">
                        {settings.visuals.logo && <img src={settings.visuals.logo} alt="Logo" className="h-10 w-auto bg-white p-1 rounded" />}
                        <h1 className="text-2xl font-bold hidden sm:block" style={{ color: settings.visuals.primaryColor }}>{settings.visuals.companyName}</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {session ? (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <div className="flex items-center space-x-2 p-1 rounded-lg bg-gray-100">
                                    <Link to="/" className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-colors text-sm ${location.pathname === '/' ? `text-white shadow-lg` : 'text-gray-500'}`} style={{ backgroundColor: location.pathname === '/' ? settings.visuals.primaryColor : 'transparent' }}>Cliente</Link>
                                    <Link to="/admin" className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-colors text-sm ${location.pathname.startsWith('/admin') ? `text-white shadow-lg` : 'text-gray-500'}`} style={{ backgroundColor: location.pathname.startsWith('/admin') ? settings.visuals.primaryColor : 'transparent' }}>Admin</Link>
                                </div>
                                <button onClick={signOut} className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-colors text-sm text-white shadow-lg`} style={{ backgroundColor: settings.visuals.primaryColor }}>Sair</button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 p-1 rounded-lg bg-gray-100">
                                <Link to="/" className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-colors text-sm ${location.pathname === '/' ? `text-white shadow-lg` : 'text-gray-500'}`} style={{ backgroundColor: location.pathname === '/' ? settings.visuals.primaryColor : 'transparent' }}>Cliente</Link>
                                <Link to="/admin" className={`px-3 sm:px-4 py-2 rounded-md font-semibold transition-colors text-sm ${location.pathname.startsWith('/admin') ? `text-white shadow-lg` : 'text-gray-500'}`} style={{ backgroundColor: location.pathname.startsWith('/admin') ? settings.visuals.primaryColor : 'transparent' }}>Admin</Link>
                            </div>
                        )}
                    </div>
                </header>
            )}
            <main>{children}</main>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <AppLayout>
                        <Routes>
                            <Route path="/" element={<CustomerView />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/admin" element={<ProtectedRoute><AdminView /></ProtectedRoute>} />
                        </Routes>
                    </AppLayout>
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}