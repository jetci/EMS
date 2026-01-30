import React from 'react';

const EmptyStateIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
      {...props}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
        <g opacity="0.3">
            {/* Road */}
            <path d="M 10 160 C 50 120, 150 120, 190 160" stroke="currentColor" strokeWidth="6" fill="none" strokeDasharray="15 10" strokeLinecap="round" />

            {/* Car body */}
            <path d="M 40 140 L 50 110 H 110 L 120 140 H 40 Z" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
            
            {/* Wheels */}
            <circle cx="60" cy="145" r="8" fill="#FFFFFF" stroke="currentColor" strokeWidth="4" />
            <circle cx="100" cy="145" r="8" fill="#FFFFFF" stroke="currentColor" strokeWidth="4" />
        </g>
         {/* Zzz text */}
        <text x="130" y="90" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="currentColor" transform="rotate(-15 130 90)">Z</text>
        <text x="145" y="80" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="bold" fill="currentColor" transform="rotate(-15 145 80)">z</text>
        <text x="160" y="75" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="currentColor" transform="rotate(-15 160 75)">z</text>
    </svg>
);

export default EmptyStateIcon;
