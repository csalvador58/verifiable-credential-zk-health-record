import { Box, Title } from '@mantine/core';
import { CarePlan } from '@medplum/fhirtypes';
import { ResourceTable, useMedplum } from '@medplum/react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import { vcs } from './vcs';

export function VcItem(): JSX.Element {
  const medplum = useMedplum();
  const { itemId } = useParams();
  // const resource: CarePlan = medplum.readResource('CarePlan', itemId as string).read();


  const resource = (vcs.find((vc: any) => vc.id === itemId))!;

  return (
    <Box p="xl">
      <Title order={2} mb="md">
        VC Details
      </Title>
      <InfoSection title="VC">
        <ResourceTable value={resource} ignoreMissingValues />
      </InfoSection>
    </Box>
  );
}
