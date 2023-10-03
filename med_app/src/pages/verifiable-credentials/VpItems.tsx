import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InfoButton } from '../../components/InfoButton';
import { InfoSection } from '../../components/InfoSection';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { IVerifiablePresentation } from './types/verifiablePresentation';

export function VpItems(): JSX.Element {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const credentials = verifiablePresentations as IVerifiablePresentation[];

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable ZK Proof of Credentials</Title>
      <InfoSection title="Available VPs">
        {!!credentials.length ? (
          <Stack spacing={0}>
            {credentials.map((record: IVerifiablePresentation) => (
              <InfoButton key={record.id} onClick={() => navigate(`./${record.id}`)}>
                <div>
                  <Text c={theme.fn.primaryColor()} fw={500} mb={4}>
                    VP#: {record.id}
                  </Text>
                </div>
                <IconChevronRight color={theme.colors.gray[5]} />
              </InfoButton>
            ))}
          </Stack>
        ) : (
          <Text>No Verifiable Credentials have been issued.</Text>
        )}
      </InfoSection>
    </Box>
  );
}
