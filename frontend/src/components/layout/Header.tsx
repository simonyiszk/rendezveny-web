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
import React, { useContext } from 'react';

import logoSmall from '../../assets/images/simonyi_white_small.svg';
import logo from '../../assets/images/simonyi_white_white.svg';
import ProtectedComponent from '../../utils/protection/ProtectedComponent';
import { RoleContext } from '../../utils/services/RoleContext';
import { resetTokens } from '../../utils/token/TokenContainer';

export default function Header(): JSX.Element {
  const roleContext = useContext(RoleContext);

  const handleLogout = (): void => {
    resetTokens();
    if (roleContext.clearRelations) roleContext.clearRelations();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
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
                isDisabled={!roleContext.isLoggedIn}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/"
              >
                Regisztráció
              </MenuItem>
              <MenuItem
                isDisabled={!roleContext.isLoggedIn}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/history"
              >
                Történet
              </MenuItem>
              <ProtectedComponent accessText={['admin', 'manager']}>
                <MenuDivider />
                <MenuItem
                  isDisabled={!roleContext.isLoggedIn}
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
                isDisabled={!roleContext.isLoggedIn}
                _hover={{ bg: 'simonyi' }}
                as={Link}
                to="/profile"
              >
                Profil
              </MenuItem>
              <ProtectedComponent accessText={['admin']}>
                <MenuItem
                  isDisabled={!roleContext.isLoggedIn}
                  _hover={{ bg: 'simonyi' }}
                  as={Link}
                  to="/logs"
                >
                  Logok
                </MenuItem>
              </ProtectedComponent>
              <MenuDivider />
              <MenuItem
                isDisabled={!roleContext.isLoggedIn}
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
