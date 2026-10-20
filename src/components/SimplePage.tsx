import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader';

/** Minimal text page used for legal placeholders and the 404 screen. */
export function SimplePage({ title, heading, text }: { title: string; heading: string; text: string }) {
  return (
    <Page title={title}>
      <PageHeader title={heading} subtext={text}>
        <View style={{ marginTop: 8 }}>
          <Button label="Back to home" href="/" variant="outline" tone="dark" />
        </View>
      </PageHeader>
    </Page>
  );
}
