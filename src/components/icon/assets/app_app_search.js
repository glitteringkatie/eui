import React from 'react';

const EuiIconAppAppSearch = ({ title, titleId, ...props }) => (
  <svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    aria-labelledby={titleId}
    {...props}>
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fillRule="evenodd"
      d="M15.5 11.915L27 5.279 19.5.938a7.002 7.002 0 00-7 0l-8 4.62A7 7 0 001 11.62v9.237a7 7 0 003.5 6.061l7.5 4.33V17.98a7 7 0 013.5-6.063zM10 27.785v-9.808a9 9 0 014.5-7.793l8.503-4.91L18.5 2.672a5.003 5.003 0 00-5 0l-8 4.619A5 5 0 003 11.62v9.238a5 5 0 002.5 4.33l4.5 2.598z"
      />
    <path
      className="euiIcon__fillSecondary"
      fillRule="evenodd"
      d="M18.409 13.55a7.089 7.089 0 011.035 1.711A6.93 6.93 0 0120 17.98v13.27l7.5-4.33a7 7 0 003.5-6.061v-9.239a6.992 6.992 0 00-1.587-4.421L18.409 13.55zm2.777.705A8.933 8.933 0 0122 17.979v9.807l4.5-2.598a5 5 0 002.5-4.33V11.62c0-.588-.106-1.161-.303-1.7l-7.511 4.335z"
    />
  </svg>
);

export const icon = EuiIconAppAppSearch;
