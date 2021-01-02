import { BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

import Button from './Button';

interface GroupProps extends BoxProps {
  value: string;
  onChangeCb?: (value: string) => void;
  children: JSX.Element[];
  isDisabled?: boolean;
}
interface ChildProps extends BoxProps {
  value: string;
  children: string;
  currentValue: string;
  onClickCb?: (e: string) => void;
  isDisabled?: boolean;
}

export function RadioGroup({
  value,
  onChangeCb,
  children,
  isDisabled,
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
            onClickCb: onChangeCb
              ? (e: string): void => onChangeCb(e)
              : undefined,
            isDisabled,
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
  isDisabled,
  ...props
}: ChildProps): JSX.Element {
  return (
    <Button
      role="radio"
      text={children}
      onClick={(): void => {
        if (onClickCb && !isDisabled) onClickCb(value);
      }}
      backgroundColor={value === currentValue ? 'simonyi' : '#fff'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      {...props}
    />
  );
}
