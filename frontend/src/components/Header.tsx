import { useApolloClient } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Image,
  Link as ChakraLink,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/core';
import { Link } from 'gatsby';
import React from 'react';

import logoSmall from '../assets/images/simonyi_white_small.svg';
import logo from '../assets/images/simonyi_white_white.svg';
import useLogoutService from '../utils/services/LogoutService';

export default function Header(): JSX.Element {
  const client = useApolloClient();
  const getLogoutService = useLogoutService(client);

  const handleLogout = () => {
    getLogoutService();
    window.location = '/login';
  };

  return (
    <Flex p={1} backgroundColor="simonyi">
      <Box>
        <Link to="/">
          <Image
            display={['none', null, 'block']}
            height="2rem"
            src={logo}
            alt="Logo"
          />
          <Image
            display={['block', null, 'none']}
            height="3rem"
            m={1}
            src={logoSmall}
            alt="Logo"
          />
        </Link>
      </Box>
      <Flex flexGrow={1} justifyContent="flex-end">
        <Flex mr="1rem">
          <Menu>
            <MenuButton fontWeight="bold">Rendezvények</MenuButton>
            <MenuList>
              <MenuItem _hover={{ bg: 'simonyi' }} as={Link} to="/">
                Regisztráció
              </MenuItem>
              <MenuItem _hover={{ bg: 'simonyi' }} as={Link} to="/history">
                Történet
              </MenuItem>
              <MenuDivider />
              <MenuItem _hover={{ bg: 'simonyi' }} as={Link} to="/manage">
                Kezelés
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Flex mr="1rem">
          <Menu>
            <MenuButton fontWeight="bold">Profil</MenuButton>
            <MenuList>
              <MenuItem _hover={{ bg: 'simonyi' }} as={Link} to="/profile">
                Profil
              </MenuItem>
              <MenuItem _hover={{ bg: 'simonyi' }} as={Link} to="/logs">
                Logok
              </MenuItem>
              <MenuDivider />
              <MenuItem _hover={{ bg: 'simonyi' }} onClick={handleLogout}>
                Kilépés
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
}
