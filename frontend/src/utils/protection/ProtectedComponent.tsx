import React from 'react';

export interface Props {
  children: React.ReactNode;
  access: boolean;
}

export default function ProtectedComponent({
  children,
  access,
}: Props): JSX.Element {
  if (access) return <>{children}</>;
  return <></>;
}
