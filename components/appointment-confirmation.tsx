import React from 'react';
import { DoctorCard, type DoctorCardProps } from './doctor-card';

export interface AppointmentConfirmationProps {
  time: string | Date;
  doctor: DoctorCardProps;
}

export const AppointmentConfirmation: React.FC<
  AppointmentConfirmationProps
> = ({ time, doctor }) => (
  <div className="my-2">
    <div className="font-semibold">Appointment Booked!</div>
    <div className="text-muted-foreground text-sm mb-2">
      Your appointment has been scheduled with:
    </div>
    <DoctorCard {...doctor} />
    <div className="text-xs text-zinc-400 mt-2">
      Time: {time ? new Date(time).toLocaleString() : ''}
    </div>
  </div>
);
