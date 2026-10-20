import { ConsoleSection, DeploymentsSection, FusionHero, ModulesSection, PipelineSection, ReadyCTA } from '@/components/home/FusionSections';
import { Page } from '@/components/Page';
import { home } from '@/config/site';

export default function Home() {
  return (
    <Page title={home.seoTitle} description={home.seoDescription}>
      <FusionHero />
      <ConsoleSection />
      <ModulesSection />
      <PipelineSection />
      <DeploymentsSection />
      <ReadyCTA />
    </Page>
  );
}
