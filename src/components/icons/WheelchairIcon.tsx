import React from 'react';

const WheelchairIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 22c5.523 0 10-4.477 10-10a10 10 0 0 0-10-10C6.477 2 2 6.477 2 12s4.477 10 10 10Z" />
    <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M10 9v6a2 2 0 0 0 2 2h2" />
    <path d="M10 15h4" />
  </svg>
);

export default WheelchairIcon;
