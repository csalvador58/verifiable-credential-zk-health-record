import { PINATA_API_KEY } from '../../config';

export interface Metadata {
  DIDkey: string;
  description: string;
  external_url: string;
  imageCID: string;
}

export const uploadMetadata = async ({ DIDkey, description, external_url, imageCID }: Metadata) => {
  try {
    const data = JSON.stringify({
      pinataContent: {
        DIDkey: DIDkey,
        description: description,
        external_url: external_url,
        image: imageCID,
      },
      pinataMetadata: {
        keyvalues: {
          did: DIDkey,
          date: new Date().toLocaleString(),
        },
        name: `Verifiable Credential ZK Health Record`,
      },
    });

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_API_KEY}`,
      },
      body: data,
    });
    const resData = await res.json();
    console.log('Metadata uploaded, CID:', resData.IpfsHash);
    return resData.IpfsHash;
  } catch (error) {
    console.log(error);
  }
};
