import { BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import Button from './Button';

interface GroupProps extends BoxProps {
  value: string;
  onChangeCb: (value: string) => void;
  children: JSX.Element[];
}
interface ChildProps extends BoxProps {
  value: string;
  children: string;
  currentValue: string;
  onClickCb: (e: string) => void;
}

export function RadioGroup({
  value,
  onChangeCb,
  children,
  ...props
}: GroupProps): JSX.Element {
  return (
    <Flex {...props}>
      {children?.map((c) => {
        return {
          ...c,
          props: {
            ...c.props,
            currentValue: value,
            onClickCb: (e: string): void => onChangeCb(e),
          },
        };
      })}
    </Flex>
  );
}

export function Radio({
  value,
  children,
  currentValue,
  onClickCb,
  ...props
}: ChildProps): JSX.Element {
  return (
    <Button
      role="radio"
      text={children}
      onClick={(): void => onClickCb(value)}
      backgroundColor={value === currentValue ? 'simonyi' : '#fff'}
      {...props}
    />
  );
}
