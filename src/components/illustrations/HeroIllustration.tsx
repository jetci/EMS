import React from 'react';

const HeroIllustration: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    viewBox="0 0 200 200"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#005A9C', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#28A745', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Background shape */}
    <path
      fill="#F0F4F8"
      d="M48.8,-68.1C63.2,-58.5,74.7,-42.6,80.1,-24.8C85.5,-7,84.8,12.7,76.5,28.6C68.2,44.5,52.3,56.7,35.4,64.9C18.4,73,-9.6,77.2,-29.9,71.2C-50.2,65.2,-62.8,49,-71,31.4C-79.1,13.8,-82.9,-5.2,-78.7,-22.4C-74.5,-39.6,-62.3,-55,-47.3,-64.3C-32.3,-73.6,-14.5,-76.8,2.7,-78.1C19.9,-79.3,34.4,-77.7,48.8,-68.1Z"
      transform="translate(100 100)"
    />
    
    {/* Central Icon */}
    <g transform="translate(35, 35) scale(0.65)">
      {/* Road */}
      <path d="M 50,180 Q 100,130 150,180" stroke="#005A9C" strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 150,180 Q 200,230 250,180" stroke="#005A9C" strokeWidth="8" fill="none" strokeLinecap="round" />

      {/* Heart */}
      <path
        d="M150 70 C120 40, 80 60, 100 90 L150 140 L200 90 C220 60, 180 40, 150 70 Z"
        fill="url(#grad1)"
      />
      
      {/* Vehicle Dot */}
       <circle cx="85" cy="165" r="10" fill="#28A745"/>
    </g>
  </svg>
);

export default HeroIllustration;
