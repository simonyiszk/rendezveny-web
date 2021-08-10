import { ArrowDownIcon, ArrowUpIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Box,
  BoxProps,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { Event, EventRelation } from '../../interfaces';
import MemberBox from './MemberBox';

enum OrderType {
  Name,
  RegistrationDate,
  CheckedIn,
}

interface OrderTextProps extends BoxProps {
  text: string;
  ownType: OrderType;
  currentType: OrderType;
  currentDirection: number;
  setTypeCb: (newType: OrderType) => void;
  setDirectionCb: (newDirection: number) => void;
}

function OrderText({
  text,
  ownType,
  currentType,
  currentDirection,
  setTypeCb,
  setDirectionCb,
  ...props
}: OrderTextProps) {
  const isActive = currentType === ownType;
  return (
    <Flex justify="center" {...props}>
      <Box
        cursor="pointer"
        onClick={() => {
          if (currentType !== ownType) {
            setTypeCb(ownType);
            setDirectionCb(0);
          } else {
            setDirectionCb((currentDirection + 1) % 2);
          }
        }}
        fontWeight={isActive ? 'bold' : 'normal'}
      >
        {text}
        {isActive && currentDirection === 0 && <ArrowDownIcon />}
        {isActive && currentDirection === 1 && <ArrowUpIcon />}
      </Box>
    </Flex>
  );
}

interface Props extends BoxProps {
  listOfMembers: EventRelation[];
  eventL: Event;
  setAttendCb: (user: EventRelation) => void;
}

export default function MemberSection({
  listOfMembers,
  eventL,
  setAttendCb,
}: Props): JSX.Element {
  const [filterName, setFilterName] = useState('');
  const [orderType, setOrderType] = useState(OrderType.CheckedIn);
  const [orderDirection, setOrderDirection] = useState(0);

  const orderFunction = (a: EventRelation, b: EventRelation): number => {
    if (orderType === OrderType.Name) {
      return a.name.localeCompare(b.name);
    }
    if (orderType === OrderType.RegistrationDate) {
      return (
        new Date(a.registration.registrationDate).valueOf() -
        new Date(b.registration.registrationDate).valueOf()
      );
    }
    // eslint-disable-next-line no-nested-ternary
    return a.registration.didAttend === b.registration.didAttend
      ? a.name.localeCompare(b.name)
      : a.registration.didAttend
      ? -1
      : 1;
  };

  const listOfMembersSorted = listOfMembers
    .filter((e: EventRelation) => e.name.startsWith(filterName))
    .sort(orderFunction);
  const listOfMembersRender =
    orderDirection === 0 ? listOfMembersSorted : listOfMembersSorted.reverse();

  return (
    <Box>
      <Box>
        <InputGroup mb={4}>
          <Input
            placeholder="Keresés név alapján"
            value={filterName}
            onChange={(event) => {
              setFilterName(event.target.value);
            }}
          />
          <InputRightElement>
            <CloseIcon
              cursor="pointer"
              onClick={() => {
                setFilterName('');
              }}
            />
          </InputRightElement>
        </InputGroup>
        <Flex justifyContent="space-between">
          <OrderText
            text="Név"
            ownType={OrderType.Name}
            currentType={orderType}
            currentDirection={orderDirection}
            setTypeCb={setOrderType}
            setDirectionCb={setOrderDirection}
            width="33%"
          />
          <OrderText
            text="Regisztráció"
            ownType={OrderType.RegistrationDate}
            currentType={orderType}
            currentDirection={orderDirection}
            setTypeCb={setOrderType}
            setDirectionCb={setOrderDirection}
            width="33%"
          />
          <OrderText
            text="Belépés"
            ownType={OrderType.CheckedIn}
            currentType={orderType}
            currentDirection={orderDirection}
            setTypeCb={setOrderType}
            setDirectionCb={setOrderDirection}
            width="33%"
          />
        </Flex>
      </Box>
      <Box>
        {listOfMembersRender.length > 0 && (
          <Box>
            {listOfMembersRender.map((e: EventRelation) => (
              <MemberBox
                key={e.userId}
                user={e}
                eventL={eventL}
                setAttendCb={setAttendCb}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}
