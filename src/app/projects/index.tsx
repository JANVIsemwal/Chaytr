import { Link, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { ClosingBanner } from '@/components/ClosingBanner';
import { FlagshipCard } from '@/components/FlagshipCard';
import { ArrowUpRight, DomainIcon } from '@/components/Icons';
import { Container, Grid, Section } from '@/components/Layout';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader';
import { Eyebrow, T } from '@/components/Typography';
import {
  COMPANY_NAME,
  domainName,
  domains,
  emptyState,
  flagships,
  projects,
  projectsPage,
  type DomainKey,
  type Project,
} from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors } from '@/theme';

type Filter = 'all' | DomainKey;

function FilterTabs({ value }: { value: Filter }) {
  const tabs: { key: Filter; label: string }[] = [{ key: 'all', label: 'All' }, ...domains.map((d) => ({ key: d.key, label: d.tab }))];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => router.setParams({ domain: t.key === 'all' ? undefined : t.key })}
          >
            {(state) => {
              const hovered = (state as { hovered?: boolean }).hovered;
              return (
                <View
                  style={{
                    height: 40,
                    paddingHorizontal: 18,
                    borderRadius: 99,
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: active ? colors.onDark : hovered ? colors.mutedOnDark : colors.lineOnDark,
                    backgroundColor: active ? colors.onDark : 'transparent',
                  }}
                >
                  <T variant="small" weight="medium" color={active ? colors.ink : colors.onDark}>
                    {t.label}
                  </T>
                </View>
              );
            }}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={(project.href ?? { pathname: '/contact', params: { interest: 'collaboration' } }) as never} asChild>
      <Pressable style={{ flex: 1 }}>
        {(state) => {
          const hovered = (state as { hovered?: boolean }).hovered;
          return (
            <View
              style={{
                flex: 1,
                minHeight: 300,
                padding: 28,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: hovered ? colors.accent : colors.line,
                backgroundColor: colors.surface,
                justifyContent: 'space-between',
                gap: 32,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <DomainIcon domain={project.domain} size={36} bg={colors.surface} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: project.status === 'Live' ? colors.success : colors.accent }} />
                  <T variant="small" weight="medium" color={colors.text}>
                    {project.status}
                  </T>
                </View>
              </View>
              <View style={{ gap: 10 }}>
                <T variant="eyebrow" color={colors.faint}>
                  {domainName(project.domain)}
                </T>
                <T variant="h3">{project.name}</T>
                <T variant="body">{project.summary}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                  <T variant="small" weight="medium" color={hovered ? colors.accentInk : colors.text}>
                    Learn more
                  </T>
                  <ArrowUpRight size={12} color={hovered ? colors.accentInk : colors.text} />
                </View>
              </View>
            </View>
          );
        }}
      </Pressable>
    </Link>
  );
}

function EmptyStateCard() {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 260,
        padding: 28,
        borderRadius: 16,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: colors.lineStrong,
        justifyContent: 'space-between',
        gap: 32,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: colors.text, alignItems: 'center', justifyContent: 'center' }}>
        <T variant="h3" style={{ lineHeight: 22 }}>
          +
        </T>
      </View>
      <View style={{ gap: 10 }}>
        <T variant="h3">{emptyState.title}</T>
        <T variant="body">{emptyState.text}</T>
        <View style={{ marginTop: 8 }}>
          <Button label="Talk to us" href={{ pathname: '/contact', params: { interest: 'collaboration' } }} variant="link" />
        </View>
      </View>
    </View>
  );
}

export default function Projects() {
  const { isMobile, isTablet } = useBreakpoint();
  const params = useLocalSearchParams<{ domain?: string }>();
  const filter: Filter = domains.some((d) => d.key === params.domain) ? (params.domain as DomainKey) : 'all';

  const visibleFlagships = flagships.filter((f) => filter === 'all' || f.domains.includes(filter));
  const visible = projects.filter((p) => filter === 'all' || p.domain === filter);
  const columns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <Page title={`Projects | ${COMPANY_NAME}`} description={`${projectsPage.subtext} Including NexPay and Bhedak.`}>
      <PageHeader title={projectsPage.heading} highlight="projects" subtext={projectsPage.subtext}>
        <View style={{ marginTop: isMobile ? 8 : 16 }}>
          <FilterTabs value={filter} />
        </View>
      </PageHeader>

      <Container style={{ gap: isMobile ? 16 : 24, paddingTop: isMobile ? 32 : 56, paddingBottom: isMobile ? 16 : 24 }}>
        {visibleFlagships.map((f) => (
          <FlagshipCard key={f.slug} project={f} />
        ))}
      </Container>

      <Section compact>
        {visible.length > 0 && (
          <View style={{ gap: 16, marginBottom: 40 }}>
            <Eyebrow>More projects</Eyebrow>
          </View>
        )}
        <Grid columns={columns} gap={20}>
          {[...visible.map((p, i) => <ProjectCard key={`${p.domain}-${i}`} project={p} />), <EmptyStateCard key="empty" />]}
        </Grid>
      </Section>

      <ClosingBanner />
    </Page>
  );
}
