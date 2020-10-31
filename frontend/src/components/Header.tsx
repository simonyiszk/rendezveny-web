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

export default function Header(): JSX.Element {
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
                Rendezvények
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
              <MenuItem>Profil</MenuItem>
              <MenuItem>Logok</MenuItem>
              <MenuItem as={Link} to="/login">
                Kilépés
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Flex>
  );
}
