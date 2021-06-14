import 'react-datepicker/dist/react-datepicker.css';

import { EditIcon } from '@chakra-ui/icons';
import { Box, Flex, Input } from '@chakra-ui/react';
import { getYear } from 'date-fns';
import hu from 'date-fns/locale/hu';
import React, { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

registerLocale('hu', hu);

const datePickerCustomHeader = ({
  date,
  decreaseMonth,
  increaseMonth,
}: {
  date: Date;
  decreaseMonth: () => void;
  increaseMonth: () => void;
}): JSX.Element => (
  <Flex fontSize="1rem" fontWeight="bold" justifyContent="space-between" px={4}>
    <Box cursor="pointer" onClick={decreaseMonth}>
      {'<'}
    </Box>
    <Flex>
      <Box mr={1}>{getYear(date)}.</Box>
      <Box>{date.toLocaleString('default', { month: 'long' })}</Box>
    </Flex>
    <Box cursor="pointer" onClick={increaseMonth}>
      {'>'}
    </Box>
  </Flex>
);

interface Props {
  name: string;
  selected: Date;
  onChange: (date: Date) => void;
}

const CustomInput = forwardRef(({ value, onClick, onChange }, ref) => {
  return (
    <Flex width="100%" onClick={onClick} ref={ref} alignItems="center">
      <EditIcon />
      <Input
        border="none"
        value={value}
        onChange={onChange}
        _focus={{ border: 'none' }}
      />
    </Flex>
  );
});

export default function Calendar({
  name,
  selected,
  onChange,
}: Props): JSX.Element {
  return (
    <DatePicker
      name={name}
      selected={selected}
      onChange={onChange}
      dateFormat="yyyy.MM.dd. HH:mm"
      locale="hu"
      renderCustomHeader={datePickerCustomHeader}
      timeCaption="Időpont"
      showTimeSelect
      timeIntervals={15}
      customInput={<CustomInput />}
    />
  );
}

export function roundTime(dateTime: Date, minuteInterval: number): Date {
  const coeff = 1000 * 60 * minuteInterval;
  return new Date(Math.round(dateTime.getTime() / coeff) * coeff);
}
export function ceilTime(dateTime: Date, minuteInterval: number): Date {
  const coeff = 1000 * 60 * minuteInterval;
  return new Date(Math.ceil(dateTime.getTime() / coeff) * coeff);
}
export function nextTime(dateTime: Date, minuteInterval: number): Date {
  const coeff = 1000 * 60 * minuteInterval;
  return new Date(Math.round(dateTime.getTime() / coeff) * coeff + coeff);
}
