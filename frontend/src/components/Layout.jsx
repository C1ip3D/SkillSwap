import {
  Box,
  Flex,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Container,
  Text,
  Avatar,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const Links = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Profile', path: '/profile' },
];

const NavLink = ({ children, to }) => (
  <Link
    as={RouterLink}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    to={to}
  >
    {children}
  </Link>
);

export default function Layout({ children }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, logout, isLoading } = useAuth();

  return (
    <Box minH='100vh' display='flex' flexDirection='column'>
      <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow='sm'>
        <Container maxW='container.xl'>
          <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
            <IconButton
              size={'md'}
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label={'Open Menu'}
              display={{ md: 'none' }}
              onClick={isOpen ? onClose : onOpen}
            />
            <HStack spacing={8} alignItems={'center'}>
              <Box fontWeight='bold' fontSize='xl' color='brand.500'>
                <Link as={RouterLink} to='/' _hover={{ textDecoration: 'none' }}>
                  SkillSwap
                </Link>
              </Box>
              <HStack
                as={'nav'}
                spacing={4}
                display={{ base: 'none', md: 'flex' }}
              >
                {Links.map((link) => (
                  <NavLink key={link.path} to={link.path}>
                    {link.name}
                  </NavLink>
                ))}
              </HStack>
            </HStack>
            <Flex alignItems={'center'}>
              {!isLoading && user ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    rounded={'full'}
                    variant={'link'}
                    cursor={'pointer'}
                    minW={0}
                  >
                    <HStack spacing={2}>
                      <Avatar size='sm' src={user.photoURL} name={user.name} />
                      <Text>{user.name}</Text>
                    </HStack>
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to='/profile'>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={logout}>Logout</MenuItem>
                  </MenuList>
                </Menu>
              ) : !isLoading ? (
                <Stack direction={'row'} spacing={4}>
                  <Button
                    as={RouterLink}
                    to='/login'
                    variant={'outline'}
                    colorScheme={'brand'}
                  >
                    Sign In
                  </Button>
                  <Button as={RouterLink} to='/register' colorScheme={'brand'}>
                    Sign Up
                  </Button>
                </Stack>
              ) : null}
            </Flex>
          </Flex>

          {isOpen ? (
            <Box pb={4} display={{ md: 'none' }}>
              <Stack as={'nav'} spacing={4}>
                {Links.map((link) => (
                  <NavLink key={link.path} to={link.path}>
                    {link.name}
                  </NavLink>
                ))}
              </Stack>
            </Box>
          ) : null}
        </Container>
      </Box>

      <Box flex='1'>{children}</Box>

      <Box
        bg={useColorModeValue('gray.50', 'gray.900')}
        color={useColorModeValue('gray.700', 'gray.200')}
        py={6}
      >
        <Container maxW='container.xl'>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            align={{ base: 'center', md: 'center' }}
            justify={{ base: 'center', md: 'space-between' }}
          >
            <Text>© 2025 SkillSwap. All rights reserved</Text>
            <Stack direction={'row'} spacing={6}>
              <Link href={'#'}>Terms</Link>
              <Link href={'#'}>Privacy</Link>
              <Link href={'#'}>Contact</Link>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
