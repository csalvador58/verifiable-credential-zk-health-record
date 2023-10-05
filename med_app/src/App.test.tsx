import { MantineProvider } from '@mantine/styles';
import { MockClient } from '@medplum/mock';
import { MedplumProvider } from '@medplum/react';
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { ToastContainer } from 'react-toastify';

test('App renders', async () => {
  await act(async () => {
    render(
      <MemoryRouter>
        <MedplumProvider medplum={new MockClient()}>
          <MantineProvider theme={{}}>
            <ToastContainer />
            <App />
          </MantineProvider>
        </MedplumProvider>
      </MemoryRouter>
    );
  });
});
