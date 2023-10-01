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

export function VcMainPage(): JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const sideMenu = !isLoggedIn ? 
    {
      title: 'Menu',
      menu: [
        { name: 'Login', href: '/vc-main/vc-items/login' },
        { name: 'View Verifiable Credentials', href: '/vc-main/vc-items' },
        { name: 'Share Proof of Credentials', href: '/vc-main/vp-items' },
      ],
    } :
    {
      title: 'Menu',
      menu: [
        { name: 'Create Verifiable Credentials', href: '/vc-main/vc-items' },
        { name: 'Share Proof of Credentials', href: '/vc-main/vp-items' },
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
