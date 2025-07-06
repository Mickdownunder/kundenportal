'use client';

import { FaCheck, FaSpinner, FaPencilRuler, FaFilePdf, FaWrench, FaShippingFast, FaHardHat, FaCheckCircle } from 'react-icons/fa';
import { ProjectStatus } from '@prisma/client';

// Die Logik für die Meilensteine lebt jetzt hier, auf der Client-Seite.
const ALL_MILESTONES = [
  { id: ProjectStatus.PLANUNG, name: "Planung", icon: FaPencilRuler },
  { id: ProjectStatus.AUFTRAG_BESTAETIGT, name: "Auftrag bestätigt", icon: FaFilePdf },
  { id: ProjectStatus.IN_PRODUKTION, name: "Küche in Produktion", icon: FaWrench },
  { id: ProjectStatus.LIEFERUNG_GEPLANT, name: "Lieferung geplant", icon: FaShippingFast },
  { id: ProjectStatus.MONTAGE_TERMINIERT, name: "Montage terminiert", icon: FaHardHat },
  { id: ProjectStatus.ABGESCHLOSSEN, name: "Projekt abgeschlossen", icon: FaCheckCircle },
];

interface StatusStepperProps {
  currentStatus: ProjectStatus;
}

export default function StatusStepper({ currentStatus }: StatusStepperProps) {
  const currentStatusIndex = ALL_MILESTONES.findIndex(m => m.id === currentStatus);

  return (
    <div className="relative pl-8 pt-2">
      <div className="absolute left-3 top-4 bottom-4 w-0.5 bg-gray-200"></div>
      <ul className="space-y-8">
        {ALL_MILESTONES.map((milestone, index) => {
          const Icon = milestone.icon;
          let status: 'completed' | 'current' | 'pending' = 'pending';
          if (index < currentStatusIndex) {
            status = 'completed';
          } else if (index === currentStatusIndex) {
            status = 'current';
          }

          return (
            <li key={index} className="flex items-center">
              <div className={`absolute left-0 z-10 flex items-center justify-center w-7 h-7 rounded-full 
                ${status === 'completed' ? 'bg-green-500' : ''}
                ${status === 'current' ? 'bg-brand-primary' : ''}
                ${status === 'pending' ? 'bg-gray-300' : ''}
              `}>
                {status === 'completed' && <FaCheck className="text-white h-4 w-4" />}
                {status === 'current' && <FaSpinner className="text-white h-4 w-4 animate-spin" />}
                {status === 'pending' && <Icon className="text-white h-4 w-4" />}
              </div>
              <div className="flex-grow">
                <span className={`font-semibold 
                  ${status === 'completed' ? 'text-gray-500 line-through' : ''}
                  ${status === 'current' ? 'text-brand-dark' : ''}
                  ${status === 'pending' ? 'text-gray-400' : ''}
                `}>
                  {milestone.name}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
