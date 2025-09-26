export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
}

export interface Employee {
  id: string;
  name: string;
  serviceIds: string[];
}

export interface Appointment {
  id: string;
  customerName: string;
  customerWhatsapp: string;
  serviceId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
}

export interface DayHours {
  start: string;
  end: string;
  lunchStart: string;
  lunchEnd: string;
  enabled: boolean;
}

export type BusinessHours = {
  [day in 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat']: DayHours;
};

export interface SocialSettings {
  whatsapp: string;
  instagram: string;
  address: string;
}

export interface VisualSettings {
  logo: string; // base64 string
  companyName: string;
  primaryColor: string;
}

export interface AppSettings {
  businessHours: BusinessHours;
  socials: SocialSettings;
  visuals: VisualSettings;
}

export interface AppContextType {
  services: Service[];
  employees: Employee[];
  appointments: Appointment[];
  settings: AppSettings | null;
  loading: boolean;
  addService: (serviceData: Omit<Service, 'id'>) => Promise<void>;
  updateService: (serviceData: Service) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  addEmployee: (employeeData: Omit<Employee, 'id'>) => Promise<void>;
  updateEmployee: (employeeData: Employee) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  addAppointment: (appointmentData: Omit<Appointment, 'id'>) => Promise<Appointment>;
  updateAppointment: (appointmentData: Appointment) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  updateSettings: (settingsData: AppSettings) => Promise<void>;
}