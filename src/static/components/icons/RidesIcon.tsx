import React from 'react';

// Using a more standard car icon
const RidesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10h-3.2c-.7 0-1.3.4-1.6.9l-1.2 2.1c-.2.5-.7.9-1.2.9H3.6c-.6 0-1.1.4-1.1.9v2.1c0 .6.5 1 1.1 1H4" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M14 17h-3" />
  </svg>
);

export default RidesIcon;
