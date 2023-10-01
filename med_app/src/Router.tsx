import { Navigate, Route, Routes } from 'react-router-dom';
import { AccountPage } from './pages/account';
import { MembershipAndBilling } from './pages/account/MembershipAndBilling';
import { Profile } from './pages/account/Profile';
import { Provider } from './pages/account/Provider';
import { VcMainPage } from './pages/vc';
import { VcItem } from './pages/vc/VcItem';
import { VcItems } from './pages/vc/VcItems';
import { VpItem } from './pages/vc/VpItem';
import { VpItems } from './pages/vc/VpItems';
import { GetCare } from './pages/GetCarePage';
import { HealthRecord } from './pages/health-record';
import { LabResult } from './pages/health-record/LabResult';
import { LabResults } from './pages/health-record/LabResults';
import { Measurement } from './pages/health-record/Measurement';
import { Medication } from './pages/health-record/Medication';
import { Medications } from './pages/health-record/Medications';
import { Vaccine } from './pages/health-record/Vaccine';
import { Vaccines } from './pages/health-record/Vaccines';
import { Vitals } from './pages/health-record/Vitals';
import { HomePage } from './pages/HomePage';
import { Messages } from './pages/MessagesPage';
import { ObservationPage } from './pages/ObservationPage';
import { SignOutPage } from './pages/SignOutPage';
import { BiconomyLogin } from './biconomy/biconomyLogin';

export function Router(): JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="messages/*" element={<Messages />} />
      <Route path="health-record/*" element={<HealthRecord />}>
        <Route index element={<Navigate replace to="/health-record/lab-results" />} />
        <Route path="lab-results/*" element={<LabResults />} />
        <Route path="lab-results/:resultId" element={<LabResult />} />
        <Route path="medications" element={<Medications />} />
        <Route path="medications/:medicationId" element={<Medication />} />
        <Route path="vaccines" element={<Vaccines />} />
        <Route path="vaccines/:vaccineId" element={<Vaccine />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="vitals/:measurementId" element={<Measurement />} />
      </Route>
      <Route path="Observation/:observationId" element={<ObservationPage />} />
      <Route path="vc-main/*" element={<VcMainPage />}>
        <Route index element={<Navigate replace to="/vc-main/vc-items" />} />
        <Route path="vc-items" element={<VcItems />} />
        <Route path="vc-items/:itemId" element={<VcItem />} />
        <Route path="vp-items" element={<VpItems />} />
        <Route path="vp-items/:itemId" element={<VpItem />} />
        <Route path="vc-items/login" element={<BiconomyLogin />} />
      </Route>
      <Route path="get-care/*" element={<GetCare />} />
      <Route path="account/*" element={<AccountPage />}>
        <Route index element={<Navigate replace to="/account/profile" />} />
        <Route path="profile" element={<Profile />} />
        <Route path="provider/*" element={<Provider />} />
        <Route path="membership-and-billing" element={<MembershipAndBilling />} />
      </Route>
      <Route path="signout" element={<SignOutPage />} />
    </Routes>
  );
}
