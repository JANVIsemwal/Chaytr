import Head from 'expo-router/head';
import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';

import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';
import { colors } from '@/theme';

/** Shell for every page: fixed navbar, scrolling content, footer. */
export function Page({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.paper }}>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
      </Head>
      <Navbar />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flexGrow: 1 }}>{children}</View>
        <Footer />
      </ScrollView>
    </View>
  );
}
