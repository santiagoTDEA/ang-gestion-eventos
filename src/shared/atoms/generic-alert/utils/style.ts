export type GenericAlertType = 'success' | 'error' | 'warning' | 'info';
export type GenericAlertResponse = {
  alertVisible: boolean;
  alertType: GenericAlertType;
  alertTitle: string;
  alertMessage: string;
};
export const STYLES: Record<GenericAlertType, { box: string; bar: string; icon: string; path: string }> = {
  success: {
    box: 'bg-green-50 border-green-200 text-green-900',
    bar: 'bg-green-500',
    icon: 'text-green-600',
    path: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  error: {
    box: 'bg-red-50 border-red-200 text-red-900',
    bar: 'bg-red-500',
    icon: 'text-red-600',
    path: 'm9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  },
  warning: {
    box: 'bg-amber-50 border-amber-200 text-amber-900',
    bar: 'bg-amber-500',
    icon: 'text-amber-600',
    path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.008v.008H12v-.008Z',
  },
  info: {
    box: 'bg-sky-50 border-sky-200 text-sky-900',
    bar: 'bg-sky-500',
    icon: 'text-sky-600',
    path: 'm11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z',
  },
};
