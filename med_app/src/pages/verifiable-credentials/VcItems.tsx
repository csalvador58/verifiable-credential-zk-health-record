import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InfoButton } from '../../components/InfoButton';
import { InfoSection } from '../../components/InfoSection';
import verifiableCredentials from './vc_store/medicationRequest_vc.json';
import verifiablePresentations from './vc_store/medicationRequest_vp.json';
import { StatusBadge } from '@medplum/react';
import { IIssuedVerifiableCredential } from './types/verifiableCredential';
import { IVerifiablePresentation } from './types/verifiablePresentation';

export function VcItems(): JSX.Element {
  const theme = useMantineTheme();
  const navigate = useNavigate();

  const credentials = verifiableCredentials as IIssuedVerifiableCredential[];

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Credentials</Title>
      <InfoSection title="Available VCs">
        {!!credentials.length ?
        (<Stack spacing={0}>
          {!!credentials.length && credentials.map((record: IIssuedVerifiableCredential) => (
            <InfoButton key={record.id} onClick={() => navigate(`./${record.id}`)}>
              <div>
                <Text c={theme.fn.primaryColor()} fw={500} mb={4}>
                  VC#: {record.id}
                </Text>
              </div>
              <StatusBadge status={(verifiablePresentations as IVerifiablePresentation[]).some((vp) => vp.id === record.id) ? "Signed" : "Not Signed"} />
              <IconChevronRight color={theme.colors.gray[5]} />
            </InfoButton>
          ))}
        </Stack>) : (
          <Text>No Verifiable Credentials have been issued.</Text>
        )}
      </InfoSection>
    </Box>
  );
}

