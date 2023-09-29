import { Anchor, Box, Button, Modal, Stack, Text, Title } from '@mantine/core';
import { formatDateTime, formatHumanName, formatTiming } from '@medplum/core';
import { HumanName, MedicationRequest } from '@medplum/fhirtypes';
import { ResourceTable, useMedplum } from '@medplum/react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import { ONYX_API } from '../../config';

export function Medication(): JSX.Element {
  const medplum = useMedplum();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { medicationId = '' } = useParams();
  const med: MedicationRequest = medplum.readResource('MedicationRequest', medicationId).read();

  return (
    <Box p="xl">
      <Title order={2}>{med.medicationCodeableConcept?.text}</Title>
      <p className="mb-6 text-lg text-gray-600">To refill this medication, please contact your pharmacy.</p>
      <p className="mb-6 text-lg text-gray-600">
        Need to create a Verifiable Credential for this record?{' '}
        <Anchor onClick={() => setModalOpen(true)}>Request a VC</Anchor>
      </p>
      <InfoSection title="Medication">
        <ResourceTable value={med} ignoreMissingValues />
      </InfoSection>
      <DIDModal prev={med} opened={modalOpen} setOpened={setModalOpen} />
    </Box>
  );
}

function DIDModal({
  prev,
  opened,
  setOpened,
}: {
  prev: MedicationRequest;
  opened: boolean;
  setOpened: (o: boolean) => void;
}): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile();
  const [loading, setLoading] = useState<boolean>(false);

  const handleVCRequest = async () => {
    console.log(prev);
    const healthRecord = prev;
    const url = `${ONYX_API}/create-signed-vc`;
    const method = 'POST';
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(healthRecord),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(`${response.status}: ${response.statusText}, ${data.error}`);
    }
    const data = await response.json();
    console.log(data.message);

    setLoading(false);
  };

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={() => setOpened(false)}
      title={<span style={{ fontSize: '24px', fontWeight: 'bold' }}>Request a Renewal</span>}
    >
      <Stack spacing="md">
        <KeyValue name="Patient" value={formatHumanName(patient?.name?.[0] as HumanName)} />
        <KeyValue name="Last Prescribed" value={formatDateTime(prev.authoredOn)} />
        <KeyValue name="Status" value={prev.status} />
        <KeyValue name="Medication" value={prev.medicationCodeableConcept?.text} />
        <KeyValue
          name="Dosage Instructions"
          value={prev.dosageInstruction?.[0]?.timing && formatTiming(prev.dosageInstruction[0].timing)}
        />
        {!loading && <Button onClick={() => handleVCRequest()}>Submit VC Request</Button>}
      </Stack>
    </Modal>
  );
}

function KeyValue({ name, value }: { name: string; value: string | undefined }): JSX.Element {
  return (
    <div>
      <Text size="xs" color="gray" tt="uppercase">
        {name}
      </Text>
      <Text size="lg" weight={500}>
        {value}
      </Text>
    </div>
  );
}
