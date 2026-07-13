import { Document, Page, View, Text, Image, StyleSheet, pdf } from '@react-pdf/renderer';
import logo from '../assets/logo.png';
import { PHOTO_SLOTS } from '../api';
import type { AnalyseRequest, AnalyseResponse, Adjustment, Impact, PhotoType } from '../api';
import { resizeBase64Image } from '../utils/resizeImage';

const IMPACT_COLORS: Record<Impact, string> = {
  High: '#ff8f1a',
  Medium: '#ffc94a',
  Low: '#8a9396',
};

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1f20',
  },
  logo: {
    width: 48,
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#5c6668',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    marginTop: 16,
    marginBottom: 8,
    borderBottom: '1pt solid #d8dedf',
    paddingBottom: 4,
  },
  paragraph: {
    fontSize: 10,
    lineHeight: 1.4,
    marginBottom: 8,
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoBlock: {
    width: 150,
    marginBottom: 10,
  },
  photoImage: {
    width: 150,
    borderRadius: 4,
    marginBottom: 4,
  },
  photoCaption: {
    fontSize: 8,
    color: '#5c6668',
    textAlign: 'center',
  },
  costGroupTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#5c6668',
    marginTop: 10,
    marginBottom: 6,
  },
  adjustmentCard: {
    border: '1pt solid #d8dedf',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  adjustmentHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adjustmentTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
  },
  impactBadge: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  adjustmentZone: {
    fontSize: 8,
    color: '#5c6668',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  adjustmentDetail: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  limitationsList: {
    fontSize: 10,
    color: '#5c6668',
  },
  limitationItem: {
    marginBottom: 4,
    lineHeight: 1.4,
  },
  disclaimer: {
    fontSize: 8,
    color: '#5c6668',
    borderTop: '1pt solid #d8dedf',
    paddingTop: 10,
    marginTop: 20,
    lineHeight: 1.4,
  },
});

export interface ResizedPhoto {
  photoType: PhotoType;
  dataUri: string;
}

interface ReportDocumentProps {
  ridingStyle: string;
  riderNotes: string;
  photos: ResizedPhoto[];
  result: AnalyseResponse;
  generatedDate: string;
}

function photoLabel(photoType: PhotoType): string {
  return PHOTO_SLOTS.find((slot) => slot.photoType === photoType)?.label ?? photoType;
}

function AdjustmentCard({ adjustment }: { adjustment: Adjustment }) {
  return (
    <View style={styles.adjustmentCard}>
      <View style={styles.adjustmentHead}>
        <Text style={styles.adjustmentTitle}>{adjustment.title}</Text>
        <Text
          style={[
            styles.impactBadge,
            { backgroundColor: `${IMPACT_COLORS[adjustment.impact]}26`, color: IMPACT_COLORS[adjustment.impact] },
          ]}
        >
          {adjustment.impact}
        </Text>
      </View>
      <Text style={styles.adjustmentZone}>{adjustment.zone}</Text>
      <Text style={styles.adjustmentDetail}>{adjustment.detail}</Text>
    </View>
  );
}

function CostGroup({ title, items }: { title: string; items: Adjustment[] }) {
  if (items.length === 0) return null;
  return (
    <View>
      <Text style={styles.costGroupTitle}>{title}</Text>
      {items.map((adjustment, i) => (
        <AdjustmentCard key={i} adjustment={adjustment} />
      ))}
    </View>
  );
}

export function ReportDocument({ ridingStyle, riderNotes, photos, result, generatedDate }: ReportDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Image src={logo} style={styles.logo} />
        <Text style={styles.adjustmentHead}>VeloKinentix</Text>
        <Text style={styles.title}>Fit Analysis Report</Text>
        <Text style={styles.subtitle}>
          Riding style: {ridingStyle} · Generated {generatedDate}
        </Text>

        {riderNotes.trim() && (
          <View>
            <Text style={styles.sectionTitle}>Rider notes</Text>
            <Text style={styles.paragraph}>{riderNotes}</Text>
          </View>
        )}

        {photos.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Source photos</Text>
            <View style={styles.photoRow}>
              {photos.map((photo) => (
                <View key={photo.photoType} style={styles.photoBlock}>
                  <Image src={photo.dataUri} style={styles.photoImage} />
                  <Text style={styles.photoCaption}>{photoLabel(photo.photoType)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Rider adjustments</Text>
        {result.riderAdjustments.map((adjustment, i) => (
          <AdjustmentCard key={i} adjustment={adjustment} />
        ))}

        <Text style={styles.sectionTitle}>Bike adjustments</Text>
        <CostGroup title="Free" items={result.bikeAdjustments.free} />
        <CostGroup title="Low cost (under $50)" items={result.bikeAdjustments.lowCost} />
        <CostGroup title="Higher cost" items={result.bikeAdjustments.highCost} />

        {result.analysisLimitations.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Analysis limitations</Text>
            <View style={styles.limitationsList}>
              {result.analysisLimitations.map((limitation, i) => (
                <Text key={i} style={styles.limitationItem}>
                  • {limitation}
                </Text>
              ))}
            </View>
          </View>
        )}

        <Text style={styles.disclaimer}>{result.disclaimer}</Text>
      </Page>
    </Document>
  );
}

function buildFilename(ridingStyle: string): string {
  const slug = ridingStyle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const date = new Date().toISOString().slice(0, 10);
  return `velokinetix-fit-report-${slug}-${date}.pdf`;
}

export async function downloadFitReportPdf(request: AnalyseRequest, result: AnalyseResponse): Promise<void> {
  const photos: ResizedPhoto[] = await Promise.all(
    request.photos.map(async (photo) => ({
      photoType: photo.photoType,
      dataUri: await resizeBase64Image(photo.base64Data, photo.mimeType, 1200),
    })),
  );

  const blob = await pdf(
    <ReportDocument
      ridingStyle={result.ridingStyle}
      riderNotes={request.riderNotes}
      photos={photos}
      result={result}
      generatedDate={new Date().toLocaleDateString()}
    />,
  ).toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = buildFilename(result.ridingStyle);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
