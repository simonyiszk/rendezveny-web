import { Box, BoxProps, Flex, PseudoBox } from '@chakra-ui/core';
import React, { useState } from 'react';

interface Props<T> extends BoxProps {
  options: T[];
  value: T[];
  labelProp: string;
  valueProp: string;
  onChangeCb: (
    values: T[],
    newValue: T | undefined,
    removedValue: T | undefined,
  ) => void;
  isInvalid?: boolean;
}

export default function Multiselect<T>({
  options,
  value,
  labelProp,
  valueProp,
  onChangeCb,
  isInvalid,
  ...props
}: Props<T>): JSX.Element {
  const [isOpen, setOpen] = useState(false);

  const unselectedValues = options.filter(
    (o) => !value.map((v) => v[valueProp]).includes(o[valueProp]),
  );

  const handleSelectedClick = (clickedValue: string): void => {
    const remove = value.filter((v) => v[valueProp] === clickedValue)[0];
    onChangeCb(
      value.filter((v) => v[valueProp] !== remove[valueProp]),
      undefined,
      remove,
    );
  };
  const handleUnSelectedClick = (clickedValue: string): void => {
    const add = unselectedValues.filter(
      (v) => v[valueProp] === clickedValue,
    )[0];
    onChangeCb([...value, add], add, undefined);
    setOpen(false);
  };
  return (
    <Flex
      width="100%"
      alignItems="center"
      position="relative"
      transition="all 0.2s"
      outline="none"
      appearance="none"
      fontSize="1rem"
      px={3}
      py={1}
      borderRadius="0.25rem"
      borderStyle="solid"
      borderWidth={isInvalid ? '2px' : '1px'}
      borderColor={isInvalid ? 'red.500' : 'inherit'}
      backgroundColor="#fff"
      minHeight="3.125rem"
      onClick={(): void => {
        setOpen(!isOpen);
      }}
      onMouseLeave={(): void => {
        // TODO Change to outside click
        setOpen(false);
      }}
    >
      <Flex flexWrap="wrap" flexGrow={1} pr={1}>
        {value.map((o) => (
          <SelectedOption
            key={o[valueProp]}
            text={o[labelProp]}
            value={o[valueProp]}
            onClickCb={handleSelectedClick}
          />
        ))}
      </Flex>
      <Flex
        pl={2}
        borderLeft="2px solid"
        borderColor="gray.400"
        fontWeight="bold"
        cursor="pointer"
        height="100%"
        alignItems="center"
        onClick={(e): void => {
          setOpen(!isOpen);
        }}
      >
        V
      </Flex>
      <Flex
        position="absolute"
        flexDir="column"
        display={isOpen ? 'flex' : 'none'}
        top="100%"
        left={0}
        width="100%"
        zIndex={3}
        borderRadius="0.25rem"
        border="1px solid"
        borderColor="inherit"
        backgroundColor="#fff"
        boxShadow="rgb(210,210,210) 2px 2px 2px 1px"
      >
        {unselectedValues.map((o) => (
          <UnselectedOption
            key={o[valueProp]}
            text={o[labelProp]}
            value={o[valueProp]}
            onClickCb={handleUnSelectedClick}
          />
        ))}
      </Flex>
    </Flex>
  );
}
Multiselect.defaultProps = {
  isInvalid: false,
};

interface SelectedProps extends BoxProps {
  text: string;
  value: string;
  onClickCb: (clickedValue: string) => void;
}
function SelectedOption({
  text,
  value,
  onClickCb,
}: SelectedProps): JSX.Element {
  return (
    <Box
      backgroundColor="simonyi"
      boxShadow="rgb(210,210,210) 1px 1px 2px 2px"
      borderRadius="5px"
      py={1}
      px={2}
      mx={1}
      my={1}
      cursor="pointer"
      onClick={(e: React.FormEvent): void => {
        e.stopPropagation();
        onClickCb(value);
      }}
    >
      {text}
    </Box>
  );
}

interface UnselectedProps extends BoxProps {
  text: string;
  value: string;
  onClickCb: (clickedValue: string) => void;
}
function UnselectedOption({
  text,
  value,
  onClickCb,
}: UnselectedProps): JSX.Element {
  return (
    <PseudoBox
      py={2}
      px={3}
      cursor="default"
      _hover={{ backgroundColor: 'simonyi' }}
      onClick={(): void => {
        onClickCb(value);
      }}
    >
      {text}
    </PseudoBox>
  );
}
