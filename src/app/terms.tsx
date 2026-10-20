import { SimplePage } from '@/components/SimplePage';
import { COMPANY_NAME, contact } from '@/config/site';

export default function Terms() {
  return (
    <SimplePage
      title={`Terms of Use | ${COMPANY_NAME}`}
      heading="Terms of Use"
      text={`Our terms of use will be published here before launch. For any questions in the meantime, contact us at ${contact.email}.`}
    />
  );
}
