import { Container, Group } from '@mantine/core';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { SideMenu } from '../../components/SideMenu';

export const sideMenu = {
  title: 'Menu',
  menu: [
    { name: 'Sign-In', href: '/did-main/login' },
    { name: 'View List', href: '/did-main/DID-items' },
    { name: 'Create', href: '/did-main/create' },
  ],
};

export function DIDMainPage(): JSX.Element {
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
