// app/screens/VerifyCertificatePage.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Linking,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { Card } from '@/components';
import api from '@/lib/api';

type VerifyRouteProp = RouteProp<{ params: { certificateId: string } }, 'params'>;

export const VerifyCertificatePage: React.FC = () => {
  const route = useRoute<VerifyRouteProp>();
  const { certificateId } = route.params;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const fetchVerificationData = async () => {
    try {
      // Use the configured API client (reads API_BASE_URL from config)
      const response = await api.get(`/verify/${certificateId}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Verifying certificate...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Icon name="close-circle" size={64} color={Colors.error} />
        <Text style={styles.errorTitle}>Invalid Certificate</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const { certificate, school, inspection } = data;
  const isActive = certificate?.status === 'ACTIVE';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="shield-check" size={48} color={Colors.primary} />
        <Text style={styles.govTitle}>Government of {school?.state || 'Maharashtra'}</Text>
        <Text style={styles.govSubtitle}>School Education Department</Text>
        <Text style={styles.pageTitle}>Certificate Verification</Text>
      </View>

      {/* Status Badge */}
      <View style={[styles.statusContainer, isActive ? styles.active : styles.inactive]}>
        <Icon name={isActive ? 'check-circle' : 'alert-circle'} size={24} color="white" />
        <Text style={styles.statusText}>{isActive ? 'ACTIVE' : 'INVALID / EXPIRED'}</Text>
      </View>

      {/* School Info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🏫 School Information</Text>
        <InfoRow label="School Name" value={school?.name} />
        <InfoRow label="UDISE Code" value={school?.udise_code} />
        <InfoRow label="Address" value={school?.address} />
        <InfoRow label="District" value={school?.district} />
        <InfoRow label="State" value={school?.state} />
        <InfoRow label="Principal" value={school?.principal_name} />
        <InfoRow label="School Type" value={school?.school_type} />
      </Card>

      {/* Certificate Info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>📜 Certificate Details</Text>
        <InfoRow label="Certificate ID" value={certificate?.certificate_id} mono />
        <InfoRow label="Recognition Number" value={certificate?.recognition_number} />
        <InfoRow label="Affiliation Number" value={certificate?.affiliation_number} />
        <InfoRow label="Valid From" value={certificate?.valid_from?.slice(0,10)} />
        <InfoRow label="Valid To" value={certificate?.valid_to?.slice(0,10)} />
        <InfoRow label="Issued On" value={certificate?.issued_at?.slice(0,10)} />
      </Card>

      {/* Inspection Info */}
      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>🔍 Inspection Summary</Text>
        <InfoRow label="Inspector Name" value={inspection?.inspector_name} />
        <InfoRow label="Badge Number" value={inspection?.inspector_badge} />
        <InfoRow label="Overall Score" value={`${inspection?.overall_score} / 100`} />
        <InfoRow label="Risk Category" value={inspection?.risk_category?.toUpperCase()} />
        <InfoRow label="Recommendation" value={inspection?.recommendation} />
        <Text style={styles.summaryText}>{inspection?.summary}</Text>
        {inspection?.weaknesses?.length > 0 && (
          <>
            <Text style={styles.weaknessTitle}>Areas for Improvement:</Text>
            {inspection.weaknesses.map((w: string, idx: number) => (
              <Text key={idx} style={styles.weaknessItem}>• {w}</Text>
            ))}
          </>
        )}
      </Card>

      {/* Security Section */}
      <Card style={styles.securityCard}>
        <Text style={styles.sectionTitle}>🔐 Security & Verification</Text>
        <InfoRow label="Certificate Hash (SHA-256)" value={certificate?.certificate_hash} mono small />
        <View style={styles.qrBadge}>
          <Icon name="qrcode" size={20} color={Colors.success} />
          <Text style={styles.qrText}>QR Code verified – issued by Government of Maharashtra</Text>
        </View>
        <TouchableOpacity
          style={styles.downloadLink}
          onPress={() => Linking.openURL(certificate?.certificate_url)}
        >
          <Icon name="file-pdf" size={20} color={Colors.primary} />
          <Text style={styles.downloadText}>Download Official PDF Certificate</Text>
        </TouchableOpacity>
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          This is a digitally signed government certificate. Any tampering will invalidate the hash.
        </Text>
      </View>
    </ScrollView>
  );
};

// Helper component
const InfoRow = ({ label, value, mono, small }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, mono && styles.mono, small && styles.small]}>{value || '—'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
  loadingText: { marginTop: Spacing.md, color: Colors.textSecondary },
  errorTitle: { fontSize: Typography.sizes.xl, fontWeight: 'bold', color: Colors.error, marginTop: Spacing.md },
  errorText: { color: Colors.textSecondary, marginTop: Spacing.sm, textAlign: 'center' },
  header: { backgroundColor: Colors.surface, paddingVertical: Spacing.xl, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border },
  govTitle: { fontSize: Typography.sizes.lg, fontWeight: 'bold', color: Colors.primary, marginTop: Spacing.sm },
  govSubtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  pageTitle: { fontSize: Typography.sizes.xl, fontWeight: 'bold', marginTop: Spacing.md },
  statusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.md, marginHorizontal: Spacing.lg, marginTop: Spacing.lg, borderRadius: BorderRadius.md, gap: Spacing.sm },
  active: { backgroundColor: Colors.success },
  inactive: { backgroundColor: Colors.error },
  statusText: { color: 'white', fontWeight: 'bold', fontSize: Typography.sizes.base },
  card: { margin: Spacing.lg, marginTop: 0, padding: Spacing.lg },
  securityCard: { margin: Spacing.lg, marginTop: 0, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.success + '40', backgroundColor: Colors.success + '08' },
  sectionTitle: { fontSize: Typography.sizes.base, fontWeight: 'bold', marginBottom: Spacing.md, color: Colors.text },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm, flexWrap: 'wrap' },
  infoLabel: { fontSize: Typography.sizes.sm, color: Colors.textMuted, width: '40%' },
  infoValue: { fontSize: Typography.sizes.sm, color: Colors.text, width: '55%', textAlign: 'right' },
  mono: { fontFamily: 'monospace', fontSize: 10 },
  small: { fontSize: 10 },
  summaryText: { marginTop: Spacing.md, fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  weaknessTitle: { marginTop: Spacing.md, fontWeight: 'bold', fontSize: Typography.sizes.sm },
  weaknessItem: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginLeft: Spacing.md, marginTop: Spacing.xs },
  qrBadge: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, gap: Spacing.sm, backgroundColor: Colors.surface, padding: Spacing.sm, borderRadius: BorderRadius.md },
  qrText: { fontSize: Typography.sizes.sm, color: Colors.success },
  downloadLink: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.md, justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  downloadText: { color: Colors.primary, fontSize: Typography.sizes.sm, fontWeight: '500' },
  footer: { padding: Spacing.lg, alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.md },
  footerText: { fontSize: Typography.sizes.xs, color: Colors.textMuted, textAlign: 'center' },
});