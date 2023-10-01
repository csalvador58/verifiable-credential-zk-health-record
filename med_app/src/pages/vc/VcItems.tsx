import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
// import { getReferenceString } from '@medplum/core';
// import { Patient } from '@medplum/fhirtypes';
// import { useMedplum } from '@medplum/react';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InfoButton } from '../../components/InfoButton';
import { InfoSection } from '../../components/InfoSection';
import vc_store from './vc_store/medicationRequest_vc.json';

export function VcItems(): JSX.Element {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  // const medplum = useMedplum();
  // const patient = medplum.getProfile() as Patient;
  // const medications = medplum.searchResources('MedicationRequest', 'patient=' + getReferenceString(patient)).read();


  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Credentials</Title>
      <InfoSection title="Available VCs">
        <Stack spacing={0}>
          {vc_store.map((record) => (
            <InfoButton key={record.id} onClick={() => navigate(`./${record.id}`)}>
              <div>
                <Text c={theme.fn.primaryColor()} fw={500} mb={4}>
                  VC#: {record.id}
                </Text>
              </div>
              {/* <StatusBadge status={resource.status as string} /> */}
              <IconChevronRight color={theme.colors.gray[5]} />
            </InfoButton>
          ))}
        </Stack>
      </InfoSection>
    </Box>
  );
}

