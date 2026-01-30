import React from 'react';

const RouteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="6" r="3" />
    <path d="M6 9v6c0 3 3 3 3 3h3" />
    <path d="M18 9v-3c0-3-3-3-3-3h-3" />
  </svg>
);

export default RouteIcon;
