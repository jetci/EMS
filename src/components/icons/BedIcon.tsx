import React from 'react';

const BedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M2 4v16" />
    <path d="M2 12h18a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H2" />
    <path d="M6 8v4" />
  </svg>
);

export default BedIcon;
