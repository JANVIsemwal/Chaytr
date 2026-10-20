import { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { C, FeedPhoto, Mono } from '@/components/fusion/kit';
import { Page } from '@/components/Page';
import { LineOfSight, RadarScope, SignalLanes } from '@/components/product/BhedakFx';
import { ProductCTA, ProductHero, Roadmap } from '@/components/product/ProductKit';
import { BhedakLogo } from '@/components/product/ProductLogo';
import { Accordion, Beats, Parameters, Statement } from '@/components/product/Showcase';
import { bhedak, COMPANY_NAME, flagships } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { fonts } from '@/theme';

const meta = flagships.find((f) => f.slug === 'bhedak')!;
const ctaHref = '/contact?interest=bhedak';

const PHOTOS = {
  assembly: require('../../../assets/photos/bhedak-assembly.jpg'),
  field: require('../../../assets/photos/bhedak.jpg'),
};

/** "What is inside?": the labelled render and the parts list. */
function Inside() {
  return (
    <View style={{ gap: 20 }}>
      <FeedPhoto source={PHOTOS.assembly} aspect={1262 / 720} caption="Prototype design render with the main components labelled." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {bhedak.components.map((c) => (
          <View key={c.part} style={{ width: '50%', minWidth: 240, flexGrow: 1, paddingVertical: 10, paddingRight: 16, gap: 3 }}>
            <Mono size={13} bold color={C.text}>
              {c.part}
            </Mono>
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 20, color: C.muted }}>{c.role}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Answers that are more than a sentence. */
const ANSWERS: Record<string, ReactNode> = {
  components: <Inside />,
  roadmap: <Roadmap stages={bhedak.roadmap} />,
};

export default function Bhedak() {
  const { isMobile } = useBreakpoint();

  return (
    <Page title={`Bhedak: handheld threat-detection radar | ${COMPANY_NAME}`} description={meta.summary}>
      <ProductHero
        slug="bhedak"
        name={bhedak.name}
        kicker={`${bhedak.name} · ${bhedak.device}`}
        status={meta.status}
        headline={bhedak.headline}
        intro={bhedak.intro}
        cta={bhedak.cta}
        ctaHref={ctaHref}
        visual={<RadarScope />}
        logo={<BhedakLogo width={isMobile ? 190 : 270} />}
      />

      <Statement {...bhedak.statement} media={<LineOfSight />} />

      <Beats tag="HOW IT WORKS" title="Two signatures. One silent alert." visual={<SignalLanes />} beats={bhedak.beats} />

      <Parameters
        tag="AT A GLANCE"
        title={bhedak.device}
        items={bhedak.params}
        visual={
          <View style={{ gap: 14 }}>
            <FeedPhoto source={PHOTOS.field} aspect={1208 / 484} feed="field test" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {bhedak.tests.map((t) => (
                <View key={t} style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: C.lineWarm }}>
                  <Mono size={11} color={C.text}>
                    ✓ {t}
                  </Mono>
                </View>
              ))}
            </View>
          </View>
        }
      />

      <Accordion tag="QUESTIONS" title="Want the details?" items={bhedak.faqs.map((f) => ({ q: f.q, a: ANSWERS[f.a] ?? f.a }))} />

      <ProductCTA title={bhedak.ctaTitle} text={bhedak.ctaText} cta={bhedak.cta} href={ctaHref} />
    </Page>
  );
}
