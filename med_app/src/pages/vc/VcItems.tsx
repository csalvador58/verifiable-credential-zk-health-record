import { Box, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { formatDate, getReferenceString } from '@medplum/core';
import { Patient } from '@medplum/fhirtypes';
import { StatusBadge, useMedplum } from '@medplum/react';
import { IconCalendar } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { InfoButton } from '../../components/InfoButton';
import { InfoSection } from '../../components/InfoSection';
// import { vcs } from './vcs';
import vcs from './vc_store/medicationRequest_vc.json';

export function VcItems(): JSX.Element {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const medplum = useMedplum();
  const patient = medplum.getProfile() as Patient;
  // const carePlans = medplum.searchResources('CarePlan', 'subject=' + getReferenceString(patient)).read();

  return (
    <Box p="xl">
      <Title mb="lg">Verifiable Credentials</Title>
      <InfoSection title="Available VCs">
        <Stack spacing={0}>
          {vcs.map((resource: any) => (
            <InfoButton key={resource.id} onClick={() => navigate(`./${resource.id}`)}>
            {/* <InfoButton key={resource.id} onClick={() => null}> */}
              <div>
                <Text c={theme.fn.primaryColor()} fw={500}>
                  {resource.title}
                </Text>
                {/* <Text mt="sm" c="gray.5" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <IconCalendar size={16} />
                  <time>{formatDate(resource.period?.start)} </time>
                  {resource.period?.end && <time>&nbsp;-&nbsp;{formatDate(resource.period.end)}</time>}
                </Text> */}
              </div>
              <StatusBadge status={resource.status as string} />
            </InfoButton>
          ))}
        </Stack>
      </InfoSection>
    </Box>
  );
}
