import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 7,
    fontFamily: 'Roboto'
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000',
    marginBottom: 2
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    minHeight: 20 
  },
  tableHeader: {
    backgroundColor: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    padding: 3,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    minHeight: 20 
  },
  lastCell: {
    borderRightWidth: 0
  },
  sectionHeader: {
    backgroundColor: '#dcdcdc',
    padding: 3,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 7,
    marginTop: 2
  },
  emptyCell: {
    color: 'transparent'
  },
  // ✅ NEW: Page number style
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
    color: '#666'
  }
});

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const formatDateOnly = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const EmptyCell = () => <Text style={styles.emptyCell}>.</Text>;

export const TicketPDFPage = ({ ticket, formData, pageNumber = 1, totalPages = 1 }) => (
  <Page size="A4" orientation="landscape" style={styles.page}>
    <Text style={styles.title}>ARIZA KAYIT FORMU</Text>

    {/* Section 1: Main Information */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '12%' }]}>
          <Text>ARIZA NO</Text>
        </View>
        <View style={[styles.tableHeader, { width: '18%' }]}>
          <Text>ARIZANIN TESPİT{'\n'}EDİLDİĞİ TARİH / SAAT</Text>
        </View>
        <View style={[styles.tableHeader, { width: '18%' }]}>
          <Text>YÜKLENİCİYE BİLDİRİM{'\n'}TARİHİ / SAATİ</Text>
        </View>
        <View style={[styles.tableHeader, { width: '37%' }]}>
          <Text>BİLDİRİM ŞEKLİ{'\n'}</Text>
          <Text style={{ fontSize: 6 }}>(Çıktısı / Fotokopisi Forma Eklenecektir)</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '15%' }]}>
          <Text>OPERASYONEL AKIŞI{'\n'}ETKİLER</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { width: '12%' }]}>
          <Text>{formData.externalCode || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '18%' }]}>
          <Text>{formatDateTime(formData.detectedDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '18%' }]}>
          <Text>{formatDateTime(formData.detectedContractorNotifiedAt) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '37%' }]}>
          <Text>
            {formData.ttcomsCode 
              ? `${formData.ttcomsCode}` 
              : (formData.detectedNotificationMethods?.length > 0 
                  ? formData.detectedNotificationMethods.join(', ') 
                  : <EmptyCell />)}
          </Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '15%' }]}>
          <Text>{formData.isBlocking ? 'EVET' : 'HAYIR'}</Text>
        </View>
      </View>
    </View>

    {/* Section 2: Part Information */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>PARÇA TANIMI</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>PARÇA NO</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>SERİ NO</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '25%' }]}>
          <Text>ARIZAYI TESPİT EDEN{'\n'}PERSONEL RÜTBE - ADI SOYADI</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formData.itemDescription || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formData.itemId || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formData.itemSerialNo || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '25%' }]}>
          <Text>{ticket?.detectedByUserName || <EmptyCell />}</Text>
        </View>
      </View>
    </View>

    {/* Section 3: Fault Description */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '84%' }]}>
          <Text>TESPİT EDİLEN ARIZA</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '16%' }]}>
          <Text>İMZA</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { minHeight: 40 }]}>
        <View style={[styles.tableCell, { width: '84%', textAlign: 'left', alignItems: 'flex-start' }]}>
          <Text>{formData.description || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '16%' }]}>
          <EmptyCell />
        </View>
      </View>
    </View>

    {/* Section 4: Contractor Header */}
    <View style={styles.sectionHeader}>
      <Text>YÜKLENİCİ FİRMA TARAFINDAN YAPILAN İŞLEMLER</Text>
    </View>

    {/* Section 5: Response Details */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>ARIZAYA MÜDAHALE{'\n'}EDEN PERSONEL</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>ARIZAYA MÜDAHALE{'\n'}TARİHİ / SAATİ</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>ARIZANIN{'\n'}GİDERİLDİĞİ{'\n'}TARİH / SAAT</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '25%' }]}>
          <Text>ARIZAYI GİDEREN{'\n'}SORUMLU YÜKLENİCİ{'\n'}PERSONELİ - ADI SOYADI</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { minHeight: 30 }]}>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{ticket?.responsePersonnel?.map(p => p.displayName).join(', ') || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.responseDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.responseResolvedAt) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '25%' }]}>
          <Text>{ticket?.responseResolvedPersonnel?.map(p => p.displayName).join(', ') || <EmptyCell />}</Text>
        </View>
      </View>
    </View>

    {/* Section 6: Actions */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '84%' }]}>
          <Text>ARIZAYA İLİŞKİN YAPILAN İŞLEM VE FAAL EDİLMESİ İÇİN GEREKLİ İHTİYAÇLAR</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '16%' }]}>
          <Text>İMZA</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { minHeight: 40 }]}>
        <View style={[styles.tableCell, { width: '84%', textAlign: 'left', alignItems: 'flex-start' }]}>
          <Text>{formData.responseActions || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '16%' }]}>
          <EmptyCell />
        </View>
      </View>
    </View>

    {/* Section 7: Activity Control Header */}
    <View style={styles.sectionHeader}>
      <Text>FAALİYET KONTROLÜ</Text>
    </View>

    {/* Section 8: Activity Control */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>FAALİYET KONTROLÜNÜ{'\n'}YAPAN KULLANICI{'\n'}PERSONELİ RÜTBE -{'\n'}ADI SOYADI / İMZA</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>SONUÇ (FAAL / GAYRİ FAAL){'\n'}(Gayri faal ise gerekçesi ve{'\n'}faaliyet için öneriler{'\n'}yazılacaktır - Sözleşme{'\n'}gereklerine göre)</Text>
        </View>
        <View style={[styles.tableHeader, { width: '25%' }]}>
          <Text>TARİH / SAAT</Text>
        </View>
        <View style={[styles.tableHeader, styles.lastCell, { width: '25%' }]}>
          <Text>BİRİM KOMUTANI{'\n'}RÜTBE - ADI SOYADI / İMZA</Text>
        </View>
      </View>
      <View style={[styles.tableRow, { minHeight: 50 }]}>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{ticket?.activityControlPersonnelName || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formData.activityControlResult || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.activityControlDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.tableCell, styles.lastCell, { width: '25%' }]}>
          <Text>{ticket?.activityControlCommanderName || <EmptyCell />}</Text>
        </View>
      </View>
    </View>

    {/* Section 9: Approval */}
    <View style={styles.table}>
      <View style={styles.tableRow}>
        <View style={[styles.tableHeader, { width: '100%' }]}>
          <Text>ONAY</Text>
        </View>
      </View>
      <View style={styles.tableRow}>
        <View style={[styles.tableCell, { width: '100%' }]}>
          <Text>{formatDateOnly(new Date())}</Text>
        </View>
      </View>
    </View>

    <Text style={styles.pageNumber}>
      Sayfa {pageNumber} / {totalPages}
    </Text>
  </Page>
);

export const TicketPDFDocument = ({ ticket, formData }) => (
  <Document>
    <TicketPDFPage ticket={ticket} formData={formData} pageNumber={1} totalPages={1} />
  </Document>
);