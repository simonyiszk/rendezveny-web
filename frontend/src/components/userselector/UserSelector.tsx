import { Box } from '@chakra-ui/react';
import React from 'react';

import { User } from '../../interfaces';

interface Props {
  users: User[];
  selectedUsers: User[];
  onClick: (user: User) => void;
}

export default function UserSelector({
  users,
  selectedUsers,
  onClick,
}: Props): JSX.Element {
  const selectedUserIds = selectedUsers.map((u) => u.id);

  return (
    <Box>
      {users.map((u) => (
        <Box
          key={u.id}
          backgroundColor={
            selectedUserIds.indexOf(u.id) > -1 ? 'simonyi' : 'white'
          }
          fontSize="1.2em"
          borderRadius="5px"
          py={1}
          px={2}
          mx={1}
          my={1}
          cursor="pointer"
          onClick={() => {
            onClick(u);
          }}
        >
          {u.name}
        </Box>
      ))}
    </Box>
  );
}
