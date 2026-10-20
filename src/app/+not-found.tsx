import { SimplePage } from '@/components/SimplePage';
import { COMPANY_NAME } from '@/config/site';

export default function NotFound() {
  return (
    <SimplePage
      title={`Page not found | ${COMPANY_NAME}`}
      heading="This page doesn't exist."
      text="The link may be broken or the page may have moved."
    />
  );
}
