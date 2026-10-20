import { Image } from 'react-native';

import { Page } from '@/components/Page';
import { CompareTable, CurrencyField, NexPayVisual } from '@/components/product/NexPayFx';
import { NexPayLogo } from '@/components/product/NexPayLogo';
import { ProductCTA, ProductHero } from '@/components/product/ProductKit';
import { Accordion, Parameters, Statement, StepExplorer } from '@/components/product/Showcase';
import { COMPANY_NAME, flagships, nexpay } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const meta = flagships.find((f) => f.slug === 'nexpay')!;
const ctaHref = '/contact?interest=nexpay';

export default function NexPay() {
  const { isMobile } = useBreakpoint();

  return (
    <Page title={`NexPay: UPI for visitors to India | ${COMPANY_NAME}`} description={meta.summary}>
      <ProductHero
        slug="nexpay"
        name={nexpay.name}
        status={meta.status}
        headline={nexpay.headline}
        intro={nexpay.intro}
        cta={nexpay.cta}
        ctaHref={ctaHref}
        visual={<NexPayVisual />}
        logo={<NexPayLogo width={isMobile ? 280 : 430} tagline />}
      />

      <Statement
        {...nexpay.statement}
        image={
          <Image
            source={require('../../../assets/photos/nexpay.jpg')}
            accessibilityLabel='A visitor at a market counter with a "UPI only" sign'
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
          />
        }
      />

      <StepExplorer tag="HOW IT WORKS" title="From landing to flying home." steps={nexpay.steps} />

      <Parameters tag="AT A GLANCE" title={'Everything a visitor needs.\nNothing they don’t.'} items={nexpay.params} visual={<CurrencyField />} />

      <Accordion
        tag="QUESTIONS"
        title="Want the details?"
        items={[{ q: 'How is it better than cash or a forex card?', a: <CompareTable columns={nexpay.compare.columns} rows={nexpay.compare.rows} /> }, ...nexpay.faqs]}
      />

      <ProductCTA title={nexpay.ctaTitle} text={nexpay.ctaText} cta={nexpay.cta} href={ctaHref} />
    </Page>
  );
}
