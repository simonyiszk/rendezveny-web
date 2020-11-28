import { BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import Button from './Button';

interface GroupProps extends BoxProps {
  value: string[];
  onChangeCb: (value: string[]) => void;
  children: JSX.Element[];
}
interface ChildProps extends BoxProps {
  value: string;
  children: string;
  currentValues: string[];
  onClickCb: (e: string) => void;
}

export function CheckboxGroup({
  value,
  onChangeCb,
  children,
  ...props
}: GroupProps): JSX.Element {
  const calcNextState = (e: string): string[] => {
    if (value.includes(e)) return value.filter((s) => s !== e);
    return [...value, e];
  };
  return (
    <Flex {...props}>
      {children?.map((c) => {
        return {
          ...c,
          props: {
            ...c.props,
            currentValues: value,
            onClickCb: (e: string): void => onChangeCb(calcNextState(e)),
          },
        };
      })}
    </Flex>
  );
}

export function Checkbox({
  value,
  children,
  currentValues,
  onClickCb,
  ...props
}: ChildProps): JSX.Element {
  return (
    <Button
      role="checkbox"
      text={children}
      onClick={(): void => onClickCb(value)}
      backgroundColor={currentValues.includes(value) ? 'simonyi' : '#fff'}
      {...props}
    />
  );
}
