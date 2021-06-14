import { extendTheme } from '@chakra-ui/react';

const Input = {
  baseStyle: {
    field: {
      borderColor: 'gray.600',
    },
  },
  defaultProps: {
    focusBorderColor: 'simonyi',
  },
};

const Select = {
  baseStyle: {
    field: {
      borderColor: 'gray.600',
    },
  },
  defaultProps: {
    focusBorderColor: 'simonyi',
  },
};

export default extendTheme({
  colors: {
    simonyi: '#6abd51',
    grayE1: '#e1e1e1',
  },
  fonts: {
    body: 'Montserrat',
    heading: 'Montserrat',
  },
  components: {
    Input,
    Select,
  },
});
