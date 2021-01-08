import { useToast } from '@chakra-ui/react';

export default function useToastService(): (
  title: string,
  isError?: boolean,
  desc?: string,
) => void {
  const toast = useToast();
  const makeToast = (title: string, isError = false, desc = ''): void => {
    toast({
      title,
      description: desc,
      status: isError ? 'error' : 'success',
      duration: 5000,
      isClosable: true,
    });
  };
  return makeToast;
}
