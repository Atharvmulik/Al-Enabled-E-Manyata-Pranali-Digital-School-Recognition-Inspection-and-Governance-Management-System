// app/screens/CertificateScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography, BorderRadius } from '@/theme';
import { Card, Button } from '@/components';
import api from '@/lib/api';

type CertificateScreenRouteProp = RouteProp<{ params: { inspectionId: string } }, 'params'>;

export const CertificateScreen: React.FC = () => {
    const route = useRoute<CertificateScreenRouteProp>();
    const navigation = useNavigation();
    const { inspectionId } = route.params;

    const [certificate, setCertificate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCertificate();
    }, []);

    const fetchCertificate = async () => {
        try {
            const response = await api.get(`/inspection/${inspectionId}/certificate`);
            setCertificate(response.data);
        } catch (error: any) {
            // 404 = certificate not yet generated or not approved
            if (error.response?.status === 404) {
                setCertificate(null);
            } else {
                Alert.alert('Error', 'Failed to load certificate. Please try again.');
                navigation.goBack();
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        if (certificate?.certificate_url) {
            Linking.openURL(certificate.certificate_url);
        } else {
            Alert.alert('Error', 'Certificate PDF not available');
        }
    };

    const handleShareQR = () => {
        if (certificate?.qr_code_url) {
            Linking.openURL(certificate.qr_code_url);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>Loading certificate...</Text>
            </View>
        );
    }

    if (!certificate) {
        return (
            <View style={styles.center}>
                <Icon name="certificate-outline" size={64} color={Colors.textMuted} />
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text, marginTop: 16 }}>
                    Certificate Not Available
                </Text>
                <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 24 }}>
                    The certificate has not been generated yet. This may happen if the inspection was not approved.
                </Text>
                <TouchableOpacity
                    style={{ marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, backgroundColor: Colors.primary, borderRadius: 8 }}
                    onPress={() => navigation.navigate('Main', { screen: 'Inspections' } as any)}
                >
                    <Text style={{ color: 'white', fontWeight: 'bold' }}>Back to Inspections</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Icon name="certificate" size={48} color={Colors.success} />
                <Text style={styles.title}>Certificate Issued</Text>
                <Text style={styles.subtitle}>
                    Your school has been successfully certified
                </Text>
            </View>

            <Card style={styles.card}>
                <Text style={styles.label}>Certificate ID</Text>
                <Text style={styles.value}>{certificate?.certificate_id}</Text>

                <Text style={styles.label}>Recognition Number</Text>
                <Text style={styles.value}>{certificate?.recognition_number}</Text>

                <Text style={styles.label}>Valid From – Valid To</Text>
                <Text style={styles.value}>
                    {certificate?.valid_from?.slice(0, 10)} → {certificate?.valid_to?.slice(0, 10)}
                </Text>

                <Text style={styles.label}>Status</Text>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{certificate?.status}</Text>
                </View>
            </Card>

            <View style={styles.buttonRow}>
                <Button
                    title="Download PDF"
                    onPress={handleDownloadPDF}
                    icon="file-pdf"
                    style={styles.button}
                />
                <Button
                    title="Share QR"
                    onPress={handleShareQR}
                    icon="qrcode"
                    style={styles.button}
                />
            </View>

            <TouchableOpacity
                style={styles.doneButton}
                onPress={() => navigation.navigate('Main', { screen: 'Inspections' })}
            >
                <Text style={styles.doneText}>Back to Dashboard</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background, padding: Spacing.lg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { alignItems: 'center', marginVertical: Spacing.xl },
    title: { fontSize: Typography.sizes.xl, fontWeight: 'bold', color: Colors.success, marginTop: Spacing.md },
    subtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.xs },
    card: { padding: Spacing.lg, marginBottom: Spacing.lg },
    label: { fontSize: Typography.sizes.sm, color: Colors.textMuted, marginTop: Spacing.md },
    value: { fontSize: Typography.sizes.base, fontWeight: '500', color: Colors.text, marginTop: Spacing.xs },
    statusBadge: { backgroundColor: Colors.success + '20', paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, alignSelf: 'flex-start', marginTop: Spacing.xs },
    statusText: { color: Colors.success, fontWeight: 'bold' },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: Spacing.lg, gap: Spacing.md },
    button: { flex: 1 },
    doneButton: { alignItems: 'center', paddingVertical: Spacing.md, marginTop: Spacing.md },
    doneText: { color: Colors.primary, fontSize: Typography.sizes.base },
});