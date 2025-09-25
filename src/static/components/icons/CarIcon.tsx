
import React from 'react';

const CarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 16.5V18a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-1.5" />
    <path d="M2 10h20" />
    <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
    <path d="M2 14h2.5" />
    <path d="M19.5 14H22" />
    <circle cx="7" cy="14" r="2" />
    <circle cx="17" cy="14" r="2" />
  </svg>
);

export default CarIcon;
