import React from 'react';
import { Card } from './ui/card';
import { FaHospitalSymbol, FaUserMd, FaRegClock, FaMoneyBillWave } from 'react-icons/fa';

export interface DoctorCardProps {
  id: number;
  name: string;
  specialty: string;
  hospital: string;
  experience: number;
  availability: string;
  fees: number;
  bio?: string;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({
  name,
  specialty,
  hospital,
  experience,
  availability,
  fees,
  bio,
}) => (
  <Card className="mb-4 p-0 overflow-hidden bg-gradient-to-r from-blue-700 to-cyan-600 text-white shadow-lg border-none">
    <div className="flex flex-col gap-2 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold mb-1">{name}</div>
          <div className="flex items-center gap-2 mb-1">
            <FaUserMd className="text-cyan-300" />
            <span className="text-cyan-200 font-semibold">{specialty}</span>
          </div>
          <div className="text-cyan-100 text-base mb-2">{bio}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="bg-cyan-800/80 rounded-full px-3 py-1 text-xs flex items-center gap-1">
          <FaHospitalSymbol className="inline text-cyan-300" /> {hospital}
        </span>
        <span className="bg-cyan-800/80 rounded-full px-3 py-1 text-xs flex items-center gap-1">
          <span className="inline-block">{experience} years exp.</span>
        </span>
        <span className="bg-cyan-800/80 rounded-full px-3 py-1 text-xs flex items-center gap-1">
          <FaMoneyBillWave className="inline text-cyan-300" /> ${fees}
        </span>
      </div>
      <div className="bg-blue-900/60 rounded-lg flex items-center justify-between px-4 py-3 mt-2">
        <div className="flex items-center gap-2">
          <FaRegClock className="text-cyan-300" />
          <span className="text-cyan-100">Available: {availability}</span>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-400 text-blue-900 font-semibold rounded-full px-4 py-1 text-xs transition">More Info</button>
      </div>
    </div>
  </Card>
); 