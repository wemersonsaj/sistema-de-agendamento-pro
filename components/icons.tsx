import React from 'react';

type IconProps = { className?: string };

export const WhatsAppIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.43.2.5.25.13.06.16.19.12.31-.03.11-.28.34-.5.44-.22.1-.47.16-.72.1-.25-.06-.5-.13-.75-.25-.25-.13-.5-.25-.75-.38-.88-.44-1.63-.94-2.25-1.5-.63-.63-1.13-1.38-1.5-2.25-.13-.25-.25-.5-.38-.75s-.19-.5-.25-.75c-.06-.25,0-.5.1-.72.1-.22.34-.47.44-.5.13-.03.25,0 .31.13.06.13.13.31.25.5s.2.43.25.5c.13.25.19.47.25.69.06.22.06.44,0 .63-.06.19-.13.31-.25.44-.13.13-.25.19-.31.25-.06.06-.06.13,0 .19.22.44.5.88.88 1.25.38.38.75.69 1.25.88.06,0 .13.06.19,0 .06-.06.13-.19.25-.31s.19-.25.25-.25c.13-.06.25,0 .44.06.19.06.44.13.69.25zM12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
);

export const InstagramIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.72 0 3.05.01 4.12.06 1.06.05 1.79.23 2.42.47.65.25 1.13.59 1.62 1.08.49.49.83.97 1.08 1.62.24.63.42 1.36.47 2.42.05 1.07.06 1.4.06 4.12s-.01 3.05-.06 4.12c-.05 1.06-.23 1.79-.47 2.42-.25.65-.59 1.13-1.08 1.62-.49.49-.97.83-1.62 1.08-.63.24-1.36.42-2.42.47-1.07.05-1.4.06-4.12.06s-3.05-.01-4.12-.06c-1.06-.05-1.79-.23-2.42-.47-.65-.25-1.13-.59-1.62-1.08-.49-.49-.83-.97-1.08-1.62-.24-.63-.42-1.36-.47-2.42-.05-1.07-.06-1.4-.06-4.12s.01-3.05.06-4.12c.05-1.06.23-1.79.47-2.42.25-.65.59-1.13 1.08-1.62.49-.49.97-.83 1.62-1.08.63-.24 1.36.42 2.42.47C8.95 2.01 9.28 2 12 2zm0 1.8c-2.67 0-2.99.01-4.04.06-1.03.05-1.5.2-1.84.34-.43.17-.75.39-1.08.72s-.55.65-.72 1.08c-.14.34-.29.81-.34 1.84-.05 1.05-.06 1.37-.06 4.04s.01 2.99.06 4.04c.05 1.03.2 1.5.34 1.84.17.43.39.75.72 1.08.33.33.65.55 1.08.72.34.14.81.29 1.84.34 1.05.05 1.37.06 4.04.06s2.99-.01 4.04-.06c1.03-.05 1.5-.2 1.84-.34.43-.17.75-.39 1.08-.72.33-.33.55-.65.72-1.08.14-.34.29-.81.34-1.84.05-1.05.06-1.37.06-4.04s-.01-2.99-.06-4.04c-.05-1.03-.2-1.5-.34-1.84-.17-.43-.39-.75-.72-1.08-.33-.33-.65-.55-1.08-.72-.34-.14-.81-.29-1.84-.34-1.05-.05-1.37-.06-4.04-.06zM12 6.88c-2.83 0-5.12 2.29-5.12 5.12s2.29 5.12 5.12 5.12 5.12-2.29 5.12-5.12-2.29-5.12-5.12-5.12zm0 8.44c-1.84 0-3.32-1.48-3.32-3.32s1.48-3.32 3.32-3.32 3.32 1.48 3.32 3.32-1.48 3.32-3.32 3.32zm6.32-8.54c0 .59-.48 1.06-1.06 1.06s-1.06-.48-1.06-1.06.48-1.06 1.06-1.06 1.06.48 1.06 1.06z"/></svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

export const PencilIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);

export const XIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
);

export const MapPinIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);

export const ClipboardListIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 11a4 4 0 110-5.292" /></svg>
);

export const CogIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
