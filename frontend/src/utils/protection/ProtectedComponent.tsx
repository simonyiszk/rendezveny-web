import React from 'react';

export interface Props {
  children: React.ReactNode;
  access?: boolean;
}

export default function ProtectedComponent({
  children,
  access = true,
}: Props): JSX.Element {
  return <>{access && <>{children}</>}</>;
}
