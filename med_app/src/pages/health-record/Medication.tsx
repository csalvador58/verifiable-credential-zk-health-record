import { Anchor, Box, Button, Modal, Stack, Text, Title } from '@mantine/core';
import { formatDateTime, formatHumanName, formatTiming } from '@medplum/core';
import { HumanName, MedicationRequest } from '@medplum/fhirtypes';
import { ResourceTable, useMedplum } from '@medplum/react';
import { useCallback, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { InfoSection } from '../../components/InfoSection';
import { ONYX_API } from '../../config';
import { ToastContainer, toast } from 'react-toastify';

type SignedVC = [string, boolean];

export function Medication(): JSX.Element {
  const medplum = useMedplum();
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { medicationId = '' } = useParams();
  const [signedVC, setSignedVC] = useState<SignedVC>(['', false]);
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
      <VcModal prev={med} opened={modalOpen} setOpened={setModalOpen} signedVC={signedVC} setSignedVC={setSignedVC} />
      {signedVC[1] && (
        <>
          <Link to="/vc-main" style={{ textDecoration: 'none' }}>
            <span style={{ fontWeight: 'bold', color: 'blue', marginLeft: '1rem' }}>
              {' '}
              Click here to go the Verifiable Credentials section to view your issued credentials
            </span>
          </Link>{' '}
        </>
      )}
    </Box>
  );
}

function VcModal({
  prev,
  opened,
  setOpened,
  signedVC,
  setSignedVC,
}: {
  prev: MedicationRequest;
  opened: boolean;
  setOpened: (o: boolean) => void;
  signedVC: SignedVC;
  setSignedVC: (o: SignedVC) => void;
}): JSX.Element {
  const medplum = useMedplum();
  const patient = medplum.getProfile();

  // Fetch signed VC from issuer
  const handleVCRequest = async () => {
    setSignedVC(['', false]);

    try {
      const healthRecord = { ...prev };
      console.log(healthRecord);
      const url = `${ONYX_API}/create-signed-vc`;
      const method = 'POST';

      const data = await toast
        .promise(
          fetch(url, {
            method: method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fhir: healthRecord }),
          }),
          {
            pending: 'Requesting VC...',
            success: 'VC Requested!',
            error: 'Error requesting VC.',
          },
          {
            position: 'top-center',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'light',
          }
        )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          setTimeout(() => {
            setOpened(false);
            setSignedVC([data.message, true]);
          }, 1000);
          return response.json();
        });
    } catch (error) {
      console.error(error);
    }
  };

  const email = patient?.telecom?.find((t) => t.system === 'email')?.value;

  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={() => setOpened(false)}
      title={<span style={{ fontSize: '24px', fontWeight: 'bold' }}>Verifiable Credential Request</span>}
    >
      <Stack spacing="md">
        <KeyValue name="Patient" value={formatHumanName(patient?.name?.[0] as HumanName)} />
        <KeyValue name="Last Prescribed" value={formatDateTime(prev.authoredOn)} />
        <KeyValue name="Status" value={prev.status} />
        <KeyValue name="Medication" value={prev.medicationCodeableConcept?.text} />
        <Instructions name="Instructions" value={email} />
        {!!signedVC && <Button onClick={async () => await handleVCRequest()}>Submit VC Request</Button>}
      </Stack>
      <ToastContainer />
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

function Instructions({ name, value }: { name: string; value: string | undefined }): JSX.Element {
  return (
    <div>
      <Text size="xs" color="gray" tt="uppercase">
        {name}
      </Text>
      <div>
        Click the submit button to request a Verifiable Credential for this medical record. Your Healthcare Provider
        will issue a signed credential containing a digital proof version of this record. After a few moments, visit the{' '}
        <Link to="/vc-main" style={{ textDecoration: 'none' }}>
          <span style={{ fontWeight: 'bold', color: 'blue' }}> Verifiable Credential</span>
        </Link>{' '}
        section of this site to view the proof of your credential. At any time, you can claim an NFT receipt containing
        the DID:key associated with this verifiable credential. Your Smart Account is linked to your login email and the
        NFT is non-transferable. <span style={{ fontWeight: 'bold', color: 'blue' }}>{value}</span>. Present the DID:key
        to a verifier who will perform a verification via a DID Registry.
      </div>
    </div>
  );
}
