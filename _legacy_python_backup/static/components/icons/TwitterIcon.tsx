import React from 'react';

const TwitterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.4 3.3 4.4s-1.4 1.4-2.8 1.4c-.7 0-1.4-.2-2-.5.8 1.5 1.5 3.5 1.5 3.5s-2.1.8-4.2-.2c-1.5 1-3.2 1.3-5 .8 1.5-1 2.3-2.5 2.3-2.5s-1.2.3-2.8-.2c-.2.3-.4.7-.4.7s-2.1-1.4-2.1-4.2c0-1.5 1.1-2.8 1.1-2.8s-.3-1.1.2-2.8c1.3.2 2.3.7 3.2 1.5 1.2-1.2 2.8-2 4.5-2.2.3-.2.5-.3.8-.3 1.2-.2 2.5.3 3.8 1.1z" />
  </svg>
);

export default TwitterIcon;
