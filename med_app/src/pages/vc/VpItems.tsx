import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
// import { getReferenceString } from '@medplum/core';
// import { Patient } from '@medplum/fhirtypes';
// import { useMedplum } from '@medplum/react';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InfoButton } from '../../components/InfoButton';
import { InfoSection } from '../../components/InfoSection';
import vp_store from './vc_store/medicationRequest_vp.json';

export function VpItems(): JSX.Element {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  // const medplum = useMedplum();
  // const patient = medplum.getProfile() as Patient;
  // const medications = medplum.searchResources('MedicationRequest', 'patient=' + getReferenceString(patient)).read();
  // import vc_store from './vc_store/medicationRequest_vc.json', if not found use empty array
  const credentials = vp_store || [];

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable ZK Proof of Credentials</Title>
      <InfoSection title="Available VPs">
        <Stack spacing={0}>
          {credentials.map((record) => (
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
      </InfoSection>
    </Box>
  );
}
