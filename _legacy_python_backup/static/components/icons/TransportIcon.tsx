import React from 'react';

const TransportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M19 17h2v-3h-2v3z" />
    <path d="M5 17h2v-3H5v3z" />
    <path d="M12 17H5.23c-.64 0-1.2-.4-1.38-1.02l-1.35-4.28A2 2 0 0 1 4.46 9h15.08a2 2 0 0 1 1.96 2.7l-1.35 4.28c-.18.62-.74 1.02-1.38 1.02H12zm0 0v-4" />
    <path d="M12 13h-2" />
  </svg>
);

export default TransportIcon;
