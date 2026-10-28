import React from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { colors, radius, spacing } from '@/theme';
import { friendlyError } from '@/utils/errors';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Erro ao sair', friendlyError(error));
    }
  };

  const name = user?.user_metadata?.name || 'Utilizador';
  const email = user?.email || '';

  return (
    <View style={styles.container}>
      <Header title="Perfil" />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <Button
          title="Sair da conta"
          variant="danger"
          onPress={handleSignOut}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.muted,
    marginTop: 2,
  },
  button: {
    marginTop: spacing.md,
  },
});