import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FieldLabel, Input } from '@/components/Form';
import { CheckIcon, ChevronDown } from '@/components/Icons';
import { Container } from '@/components/Layout';
import { Page } from '@/components/Page';
import { PageHeader } from '@/components/PageHeader';
import { T } from '@/components/Typography';
import { COMPANY_NAME, contact, contactPage, interests, type InterestKey } from '@/config/site';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { colors, fonts } from '@/theme';

function Select({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: InterestKey | null;
  onChange: (v: InterestKey) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = interests.find((i) => i.key === value);

  return (
    <View style={{ zIndex: 10 }}>
      <FieldLabel error={error}>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'Select an option'}`}
        onPress={() => setOpen((o) => !o)}
        style={{
          height: 52,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: error ? colors.danger : open ? colors.text : colors.line,
          backgroundColor: colors.paper,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontFamily: fonts.body, fontSize: 16, color: selected ? colors.text : colors.faint }}>
          {selected?.label ?? 'Select an option'}
        </Text>
        <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
          <ChevronDown color={colors.muted} />
        </View>
      </Pressable>

      {open && (
        <View
          accessibilityRole="menu"
          style={{
            position: 'absolute',
            top: 30 + 52 + 6,
            left: 0,
            right: 0,
            backgroundColor: colors.surface,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.line,
            paddingVertical: 6,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          }}
        >
          {interests.map((opt) => {
            const active = opt.key === value;
            return (
              <Pressable
                key={opt.key}
                accessibilityRole="menuitem"
                onPress={() => {
                  onChange(opt.key);
                  setOpen(false);
                }}
              >
                {(state) => (
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: (state as { hovered?: boolean }).hovered ? colors.paper : 'transparent',
                    }}
                  >
                    <Text style={{ fontFamily: active ? fonts.bodyMedium : fonts.body, fontSize: 15, color: colors.text }}>
                      {opt.label}
                    </Text>
                    {active && <CheckIcon size={14} color={colors.accent} />}
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

type Errors = Partial<Record<'name' | 'email' | 'interest' | 'message', string>>;

function ContactForm() {
  const params = useLocalSearchParams<{ interest?: string }>();
  const initialInterest = interests.find((i) => i.key === params.interest)?.key ?? null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState<InterestKey | null>(initialInterest);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'emailApp' | 'failed'>('idle');

  const validate = () => {
    const e: Errors = {};
    if (!name.trim()) e.name = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) e.email = 'Enter a valid email';
    if (!interest) e.interest = 'Choose one';
    if (message.trim().length < 10) e.message = 'Tell us a little more';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    const topic = interests.find((i) => i.key === interest)?.label ?? 'General';
    // No form service set up: hand the message to the visitor's own email app.
    if (!contact.formEndpoint) {
      const subject = `${COMPANY_NAME} website: ${topic}`;
      const body = `${message.trim()}

— ${name.trim()} (${email.trim()})`;
      Linking.openURL(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      setStatus('emailApp');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(contact.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), interest: topic, message: message.trim(), _subject: `${COMPANY_NAME} website: ${topic}` }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  };

  if (status === 'sent' || status === 'emailApp') {
    return (
      <View style={{ gap: 20, paddingVertical: 24 }} accessibilityLiveRegion="polite">
        <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon size={22} color={colors.accent} />
        </View>
        <T variant="h3">{status === 'sent' ? contactPage.success : contactPage.successEmailApp}</T>
        {status === 'emailApp' && (
          <T variant="body">
            Email app didn&apos;t open? Write to us at {contact.email}.
          </T>
        )}
        <Button
          label="Send another message"
          variant="link"
          onPress={() => {
            setName('');
            setEmail('');
            setMessage('');
            setInterest(null);
            setStatus('idle');
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ gap: 22 }}>
      <Input label="Full name" value={name} onChangeText={setName} error={errors.name} autoComplete="name" placeholder="Your name" />
      <Input
        label="Email address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        autoComplete="email"
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder="you@example.com"
      />
      <Select label="I'm interested in" value={interest} onChange={setInterest} error={errors.interest} />
      <Input label="Message" value={message} onChangeText={setMessage} error={errors.message} multiline placeholder="Tell us about your idea or question" />
      {status === 'failed' && (
        <T variant="small" color={colors.danger}>
          Something went wrong. Please try again, or email us directly.
        </T>
      )}
      <View style={{ marginTop: 6 }}>
        <Button label={status === 'sending' ? 'Sending…' : 'Send Message'} onPress={submit} disabled={status === 'sending'} fullWidth />
      </View>
    </View>
  );
}

function Detail({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <View style={{ paddingVertical: 20, borderTopWidth: 1, borderTopColor: colors.line, gap: 6 }}>
      <T variant="eyebrow" color={colors.faint}>
        {label}
      </T>
      <Pressable disabled={!href} onPress={() => href && Linking.openURL(href)}>
        <T variant="lead" color={colors.text}>
          {value}
        </T>
      </Pressable>
    </View>
  );
}

export default function Contact() {
  const { isMobile, isTablet } = useBreakpoint();
  const isPlaceholder = (v: string) => v.startsWith('[');

  return (
    <Page
      title={`Contact Us | ${COMPANY_NAME}`}
      description={`Partner, collaborate, invest, join the team or try NexPay early. Get in touch with ${COMPANY_NAME}.`}
    >
      <PageHeader title={contactPage.headline} highlight="together." subtext={contactPage.subtext} extraBottom={isTablet ? 0 : 120} />

      <Container style={{ paddingTop: isTablet ? 40 : 0, paddingBottom: isMobile ? 72 : 128 }}>
        <View style={{ flexDirection: isTablet ? 'column-reverse' : 'row', gap: isTablet ? 56 : 96 }}>
          <View style={{ flex: isTablet ? undefined : 1, gap: 24, paddingTop: isTablet ? 0 : 64 }}>
            <View style={{ borderBottomWidth: 1, borderBottomColor: colors.line }}>
              <Detail label="Email" value={contact.email} href={isPlaceholder(contact.email) ? undefined : `mailto:${contact.email}`} />
              <Detail label="Phone" value={contact.phone} href={isPlaceholder(contact.phone) ? undefined : `tel:${contact.phoneTel}`} />
              <Detail label="Location" value={contact.location} href={contact.mapUrl} />
            </View>
          </View>

          <View style={{ flex: isTablet ? undefined : 1.1, marginTop: isTablet ? 0 : -160 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.line,
                padding: isMobile ? 22 : 40,
                borderTopWidth: 3,
                borderTopColor: colors.accent,
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 40,
                shadowOffset: { width: 0, height: 20 },
              }}
            >
              <View style={{ gap: 8, marginBottom: 28 }}>
                <T variant="h3">Send us a message</T>
                <T variant="small">All fields are required.</T>
              </View>
              <ContactForm />
            </View>
          </View>
        </View>
      </Container>
    </Page>
  );
}
