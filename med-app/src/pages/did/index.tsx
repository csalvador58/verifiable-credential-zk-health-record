import { Container, Group } from '@mantine/core';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { SideMenu } from '../../components/SideMenu';

// export const sideMenu = {
//   title: 'Menu',
//   menu: [
//     { name: 'Sign-In', href: '/did-main/login' },
//     { name: 'View List', href: '/did-main/DID-items' },
//     { name: 'Create', href: '/did-main/create' },
//   ],
// };

export function DIDMainPage(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const sideMenu = !isLoggedIn ? 
    {
      title: 'Menu',
      menu: [
        { name: 'Sign-In', href: '/did-main/login' },
        { name: 'View List', href: '/did-main/DID-items' },
        { name: 'Create', href: '/did-main/create' },
      ],
    } :
    {
      title: 'Menu',
      menu: [
        { name: 'View List', href: '/did-main/DID-items' },
        { name: 'Create', href: '/did-main/create' },
      ],
    };

  return (
    <Container>
      <Group align="top">
        <SideMenu {...sideMenu} />
        <div style={{ width: 800, flex: 800 }}>
          <Suspense fallback={<Loading />}>
            <Outlet />
          </Suspense>
        </div>
      </Group>
    </Container>
  );
}
