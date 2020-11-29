import { BoxProps, Flex } from '@chakra-ui/core';
import React from 'react';

import Button from './Button';

interface GroupProps extends BoxProps {
  value: string[];
  onChangeCb?: (value: string[]) => void;
  children: JSX.Element[];
  isDisabled?: boolean;
}
interface ChildProps extends BoxProps {
  value: string;
  children: string;
  currentValues: string[];
  onClickCb?: (e: string) => void;
  isDisabled?: boolean;
}

export function CheckboxGroup({
  value,
  onChangeCb,
  children,
  isDisabled,
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
            onClickCb: onChangeCb
              ? (e: string): void => onChangeCb(calcNextState(e))
              : undefined,
            isDisabled,
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
  isDisabled,
  ...props
}: ChildProps): JSX.Element {
  return (
    <Button
      role="checkbox"
      text={children}
      onClick={(): void => {
        if (onClickCb && !isDisabled) onClickCb(value);
      }}
      backgroundColor={currentValues.includes(value) ? 'simonyi' : '#fff'}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      {...props}
    />
  );
}
