import { Container, Group } from '@mantine/core';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Loading } from '../../components/Loading';
import { SideMenu } from '../../components/SideMenu';

export function VcMainPage(): JSX.Element {

  const sideMenu = {
    title: 'Menu',
    menu: [
      { name: 'Create Verifiable Credentials', href: '/vc-main/vc-items' },
      { name: 'View/Share Proof of Credentials', href: '/vc-main/vp-items' },
      { name: '**Demo Only** - Verifiers', href: '/vc-main/verify-items' },
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
