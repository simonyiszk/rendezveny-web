import { useApolloClient } from '@apollo/client';
import {
  Box,
  Button,
  Flex,
  Image,
  Link as ChakraLink,
  Menu,
  MenuButton,
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
            <MenuButton>Rendezvények</MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/">
                Regisztráció
              </MenuItem>
              <MenuItem as={Link} to="/manage">
                Kezelés
              </MenuItem>
              <MenuItem as={Link} to="/history">
                Történet
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
        <Flex mr="1rem">
          <Menu>
            <MenuButton>Profil</MenuButton>
            <MenuList>
              <MenuItem as={Link} to="/profile">
                Profil
              </MenuItem>
              <MenuItem as={Link} to="/logs">
                Logok
              </MenuItem>
              <MenuItem onClick={handleLogout}>Kilépés</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
}
