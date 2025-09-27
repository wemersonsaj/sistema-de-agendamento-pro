import { Service, Employee, Appointment, AppSettings, BusinessHours, DayHours } from '../types';
import { supabase } from '@/src/integrations/supabase/client';
import { INITIAL_SETTINGS } from '../data/initialData';

// --- Error Handling ---
const handleSupabaseError = (error: any, context: string) => {
    console.error(`Supabase error in ${context}:`, error);
    throw new Error(`Failed to ${context}. Please check the console for details.`);
};

// --- Services API ---
export const getServices = async (): Promise<Service[]> => {
    const { data, error } = await supabase.from('services').select('*');
    if (error) handleSupabaseError(error, 'fetch services');
    return data || [];
};

export const addService = async (serviceData: Omit<Service, 'id'>): Promise<Service> => {
    const { data, error } = await supabase.from('services').insert(serviceData).select().single();
    if (error) handleSupabaseError(error, 'add service');
    return data;
};

export const updateService = async (serviceData: Service): Promise<Service> => {
    const { id, ...updateData } = serviceData;
    const { data, error } = await supabase.from('services').update(updateData).eq('id', id).select().single();
    if (error) handleSupabaseError(error, 'update service');
    return data;
};

export const deleteService = async (id: string): Promise<void> => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'delete service');
};

// --- Employees API ---
export const getEmployees = async (): Promise<Employee[]> => {
    const { data, error } = await supabase.from('employees').select(`
        id,
        name,
        employee_services ( service_id )
    `);
    if (error) handleSupabaseError(error, 'fetch employees');
    
    return data ? data.map(emp => ({
        id: emp.id,
        name: emp.name,
        serviceIds: emp.employee_services.map((es: any) => es.service_id)
    })) : [];
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    const { name, serviceIds } = employeeData;
    
    const { data: newEmployee, error: employeeError } = await supabase.from('employees').insert({ name }).select().single();
    if (employeeError || !newEmployee) handleSupabaseError(employeeError, 'add employee name');

    if (serviceIds && serviceIds.length > 0) {
        const relations = serviceIds.map(service_id => ({
            employee_id: newEmployee.id,
            service_id
        }));
        const { error: relationError } = await supabase.from('employee_services').insert(relations);
        if (relationError) handleSupabaseError(relationError, 'add employee services');
    }
    
    return { ...newEmployee, serviceIds };
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
    const { id, name, serviceIds } = employeeData;

    const { error: employeeError } = await supabase.from('employees').update({ name }).eq('id', id);
    if (employeeError) handleSupabaseError(employeeError, 'update employee name');

    const { error: deleteError } = await supabase.from('employee_services').delete().eq('employee_id', id);
    if (deleteError) handleSupabaseError(deleteError, 'delete old employee services');

    if (serviceIds && serviceIds.length > 0) {
        const relations = serviceIds.map(service_id => ({
            employee_id: id,
            service_id
        }));
        const { error: insertError } = await supabase.from('employee_services').insert(relations);
        if (insertError) handleSupabaseError(insertError, 'add new employee services');
    }

    return employeeData;
};

export const deleteEmployee = async (id: string): Promise<void> => {
    const { error: relationError } = await supabase.from('employee_services').delete().eq('employee_id', id);
    if (relationError) handleSupabaseError(relationError, 'delete employee services');

    const { error: employeeError } = await supabase.from('employees').delete().eq('id', id);
    if (employeeError) handleSupabaseError(employeeError, 'delete employee');
};

// --- Appointments API ---
export const getAppointments = async (): Promise<Appointment[]> => {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) handleSupabaseError(error, 'fetch appointments');
    return data ? data.map(apt => ({
        id: apt.id,
        customerName: apt.customer_name,
        customerWhatsapp: apt.customer_whatsapp,
        serviceId: apt.service_id,
        employeeId: apt.employee_id,
        date: apt.date,
        time: apt.time,
    })) : [];
};

export const addAppointment = async (appointmentData: Omit<Appointment, 'id'>): Promise<Appointment> => {
    const { customerName, customerWhatsapp, serviceId, employeeId, date, time } = appointmentData;
    const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        service_id: serviceId,
        employee_id: employeeId,
        date,
        time
    };
    const { data, error } = await supabase.from('appointments').insert(payload).select().single();
    if (error || !data) handleSupabaseError(error, 'add appointment');
    
    return {
        id: data.id,
        customerName: data.customer_name,
        customerWhatsapp: data.customer_whatsapp,
        serviceId: data.service_id,
        employeeId: data.employee_id,
        date: data.date,
        time: data.time,
    };
};

export const updateAppointment = async (appointmentData: Appointment): Promise<Appointment> => {
    const { id, customerName, customerWhatsapp, serviceId, employeeId, date, time } = appointmentData;
    const payload = {
        customer_name: customerName,
        customer_whatsapp: customerWhatsapp,
        service_id: serviceId,
        employee_id: employeeId,
        date,
        time
    };
    const { data, error } = await supabase.from('appointments').update(payload).eq('id', id).select().single();
    if (error || !data) handleSupabaseError(error, 'update appointment');
    
    return {
        id: data.id,
        customerName: data.customer_name,
        customerWhatsapp: data.customer_whatsapp,
        serviceId: data.service_id,
        employeeId: data.employee_id,
        date: data.date,
        time: data.time,
    };
};

export const deleteAppointment = async (id: string): Promise<void> => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) handleSupabaseError(error, 'delete appointment');
};

// --- Settings API ---
export const getSettings = async (): Promise<AppSettings> => {
    let { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
    
    if (error && error.code === 'PGRST116') { // No settings row found
        console.log('No settings found, creating initial settings.');
        const { data: newSettings, error: insertError } = await supabase.from('settings').insert({ 
            id: 1, 
            business_hours: INITIAL_SETTINGS.businessHours,
            socials: INITIAL_SETTINGS.socials,
            visuals: INITIAL_SETTINGS.visuals,
            goal: INITIAL_SETTINGS.goal,
        }).select().single();
        if (insertError) handleSupabaseError(insertError, 'create initial settings');
        data = newSettings;
    } else if (error) {
        handleSupabaseError(error, 'fetch settings');
    }
    
    if (!data) return INITIAL_SETTINGS;

    // Ensure backward compatibility for lunchEnabled property
    const businessHoursWithDefaults = Object.entries(data.business_hours).reduce((acc, [day, hours]) => {
        acc[day as keyof BusinessHours] = {
            ...(hours as DayHours),
            lunchEnabled: (hours as any).lunchEnabled ?? true, // Default to true if missing
        };
        return acc;
    }, {} as BusinessHours);

    return {
        businessHours: businessHoursWithDefaults,
        socials: data.socials,
        visuals: data.visuals,
        goal: data.goal || null,
    };
};

export const updateSettings = async (settingsData: AppSettings): Promise<AppSettings> => {
    const payload = {
        business_hours: settingsData.businessHours,
        socials: settingsData.socials,
        visuals: settingsData.visuals,
        goal: settingsData.goal,
    };
    const { data, error } = await supabase.from('settings').update(payload).eq('id', 1).select().single();
    if (error || !data) handleSupabaseError(error, 'update settings');
    
    return {
        businessHours: data.business_hours,
        socials: data.socials,
        visuals: data.visuals,
        goal: data.goal,
    };
};