import { AddIcon } from '@chakra-ui/icons';
import { Box, BoxProps, Flex } from '@chakra-ui/react';
import React from 'react';

interface Props<T> extends BoxProps {
  value: T[];
  labelProp: string;
  valueProp: string;
  isInvalid?: boolean;
  onClick: () => void;
}

export default function Multiselectpopup<T>({
  value,
  labelProp,
  valueProp,
  isInvalid,
  onClick,
  ...props
}: Props<T>): JSX.Element {
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
      height="100%"
    >
      <Flex flexWrap="wrap" flexGrow={1} pr={1}>
        {value.map((o) => (
          <SelectedOption key={o[valueProp]} text={o[labelProp]} />
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
          onClick();
        }}
      >
        <AddIcon />
      </Flex>
    </Flex>
  );
}
Multiselectpopup.defaultProps = {
  isInvalid: false,
};

interface SelectedProps extends BoxProps {
  text: string;
}
function SelectedOption({ text }: SelectedProps): JSX.Element {
  return (
    <Box
      backgroundColor="simonyi"
      boxShadow="rgb(210,210,210) 1px 1px 2px 2px"
      borderRadius="5px"
      py={1}
      px={2}
      mx={1}
      my={1}
    >
      {text}
    </Box>
  );
}
