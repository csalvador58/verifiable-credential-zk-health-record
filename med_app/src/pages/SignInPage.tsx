import { BackgroundImage, Box, SimpleGrid } from '@mantine/core';
import { SignInForm } from '@medplum/react';
import { useNavigate } from 'react-router-dom';
import { MEDPLUM_GOOGLE_CLIENT_ID, MEDPLUM_PROJECT_ID } from '../config';

export function SignInPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <SimpleGrid cols={2}>
      <Box pt={100} pb={200}>
        <SignInForm
          projectId={MEDPLUM_PROJECT_ID}
          googleClientId={MEDPLUM_GOOGLE_CLIENT_ID}
          onSuccess={() => navigate('/')}
        >
          <h2>Sign in to HMS</h2>
        </SignInForm>
      </Box>
      <BackgroundImage src="https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&amp;auto=format&amp;fit=crop&amp;w=1567&amp;q=80" />
    </SimpleGrid>
  );
}
