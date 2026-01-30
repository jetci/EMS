import React from 'react';

const AssignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22V12" />
    <circle cx="6" cy="6" r="3" />
    <path d="m18 13 2-2-4-4-2 2" />
    <path d="m13 18-2 2 4 4 2-2" />
  </svg>
);

export default AssignIcon;
