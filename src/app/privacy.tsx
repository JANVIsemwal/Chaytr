import { SimplePage } from '@/components/SimplePage';
import { COMPANY_NAME, contact } from '@/config/site';

export default function Privacy() {
  return (
    <SimplePage
      title={`Privacy Policy | ${COMPANY_NAME}`}
      heading="Privacy Policy"
      text={`Our full privacy policy will be published here before launch. For any privacy questions in the meantime, contact us at ${contact.email}.`}
    />
  );
}
