import { useApolloClient } from '@apollo/client';
import {
  Box,
  Flex,
  Image,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { Link } from 'gatsby';
import React from 'react';

import logoSmall from '../../assets/images/simonyi_white_small.svg';
import logo from '../../assets/images/simonyi_white_white.svg';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import useLogoutService from '../../utils/services/LogoutService';
import { isLoggedin } from '../../utils/token/TokenContainer';

export default function Header(): JSX.Element {
  const client = useApolloClient();
  const getLogoutService = useLogoutService(client);

  const handleLogout = (): void => {
    getLogoutService();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
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
              <MenuItem
                isDisabled={!isLoggedin()}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/"
              >
                Regisztráció
              </MenuItem>
              <MenuItem
                isDisabled={!isLoggedin()}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/history"
              >
                Történet
              </MenuItem>
              <ProtectedComponent accessText={['admin', 'manager']}>
                <MenuDivider />
                <MenuItem
                  isDisabled={!isLoggedin()}
                  _hover={{ bg: 'simonyi' }}
                  as={Link}
                  to="/create"
                >
                  Létrehozás
                </MenuItem>
              </ProtectedComponent>
            </MenuList>
          </Menu>
        </Flex>
        <Flex mr="1rem">
          <Menu>
            <MenuButton fontWeight="bold">Profil</MenuButton>
            <MenuList>
              <MenuItem
                isDisabled={!isLoggedin()}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/profile"
              >
                Profil
              </MenuItem>
              <ProtectedComponent accessText={['admin']}>
                <MenuItem
                  isDisabled={!isLoggedin()}
                  _hover={{ bg: 'simonyi' }}
                  as={Link}
                  to="/logs"
                >
                  Logok
                </MenuItem>
              </ProtectedComponent>
              <MenuDivider />
              <MenuItem
                isDisabled={!isLoggedin()}
                _hover={{ bg: 'simonyi' }}
                onClick={handleLogout}
              >
                Kilépés
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
}
