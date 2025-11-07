import React from 'react';

const AzureLogo = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 128 128"
    className={className}
    aria-label="Azure Logo"
    role="img"
  >
    <defs>
      <linearGradient
        id="azure-gradient-a"
        x1="41.57"
        x2="93.8"
        y1="29.98"
        y2="114.78"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#114a8b" />
        <stop offset="1" stopColor="#0669d2" />
      </linearGradient>
      <linearGradient
        id="azure-gradient-b"
        x1="28.98"
        x2="73.1"
        y1="82.89"
        y2="10.44"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#3ccbf4" />
        <stop offset="1" stopColor="#289bf0" />
      </linearGradient>
    </defs>
    <path fill="#0078d4" d="M72.53,23.42,42.1,98.81h25.84l7.1-21.36h33.8Z" />
    <path fill="url(#azure-gradient-a)" d="m57.25,6,35.42,112.54h-26L42,23.42Z" />
    <path fill="url(#azure-gradient-b)" d="M72.53,23.42,42.1,98.81h17.2L81.79,23.42Z" />
  </svg>
);

export default AzureLogo;
