import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 'bold',
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 40,
    paddingHorizontal: 28,
    fontSize: 8,
    fontFamily: 'Roboto',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  // main outer table
  table: {
    display: 'table',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#000000',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  // generic cell
  headerCell: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 3,
    textAlign: 'center',
    fontWeight: 'bold',
    justifyContent: 'center',
  },
  cell: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
    paddingVertical: 3,
    paddingHorizontal: 3,
    textAlign: 'center',
    justifyContent: 'center',
  },
  lastCell: {
    borderRightWidth: 0,
  },
  leftText: {
    textAlign: 'left',
  },
  // rows with more height (description / actions / activity result)
  tallRow: {
    minHeight: 45,
  },
  veryTallRow: {
    minHeight: 55,
  },
  fullRowHeader: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  fullRowHeaderCenter: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fullRowCell: {
    paddingVertical: 3,
    paddingHorizontal: 3,
    textAlign: 'center',
  },
  emptyCell: {
    color: 'transparent',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 8,
  },
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

const formatDateOnly = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const EmptyCell = () => <Text style={styles.emptyCell}>.</Text>;

export const TicketPDFPage = ({ ticket, formData, pageNumber = 1, totalPages = 1 }) => (
  <Page size="A4" orientation="landscape" style={styles.page}>
    <Text style={styles.title}>ARIZA KAYIT FORMU</Text>

    <View style={styles.table}>
      {/* 1. row: ARIZA NO / TARİHLER / BİLDİRİM ŞEKLİ / OPERASYONEL AKIŞI ETKİLER */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '12%' }]}>
          <Text>ARIZA NO</Text>
        </View>
        <View style={[styles.headerCell, { width: '17%' }]}>
          <Text>ARIZANIN TESPİT</Text>
          <Text>EDİLDİĞİ TARİH / SAAT</Text>
        </View>
        <View style={[styles.headerCell, { width: '16%' }]}>
          <Text>YÜKLENİCİYE BİLDİRİM</Text>
          <Text>TARİHİ / SAATİ</Text>
        </View>
        <View style={[styles.headerCell, { width: '35%' }]}>
          <Text>BİLDİRİM ŞEKLİ</Text>
          <Text style={{ fontSize: 6 }}>(Çıktısı / Fotokopisi Forma Eklenecektir)</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '20%' }]}>
          <Text>OPERASYONEL AKIŞI</Text>
          <Text>ETKİLER</Text>
        </View>
      </View>

      {/* 2. row: values for above */}
      <View style={styles.row}>
        <View style={[styles.cell, { width: '12%' }]}>
          <Text>{formData.externalCode || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '17%' }]}>
          <Text>{formatDateTime(formData.detectedDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '16%' }]}>
          <Text>{formatDateTime(formData.detectedContractorNotifiedAt) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '35%' }]}>
          <Text>
            {formData.ttcomsCode
              ? formData.ttcomsCode
              : formData.detectedNotificationMethods?.length > 0
                ? formData.detectedNotificationMethods.join(', ')
                : <EmptyCell />}
          </Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '20%' }]}>
          <Text>{formData.isBlocking ? 'EVET' : 'HAYIR'}</Text>
        </View>
      </View>

      {/* 3. row: PARÇA TANIMI / PARÇA NO / SERİ NO / ARIZAYI TESPİT EDEN... */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '29%' }]}>
          <Text>PARÇA TANIMI</Text>
        </View>
        <View style={[styles.headerCell, { width: '16%' }]}>
          <Text>PARÇA NO</Text>
        </View>
        <View style={[styles.headerCell, { width: '35%' }]}>
          <Text>SERİ NO</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '20%' }]}>
          <Text>ARIZAYI TESPİT EDEN</Text>
          <Text>PERSONEL RÜTBE - ADI SOYADI</Text>
        </View>
      </View>

      {/* 4. row: part values */}
      <View style={styles.row}>
        <View style={[styles.cell, { width: '29%' }]}>
          <Text>{formData.itemDescription || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '16%' }]}>
          <Text>{formData.itemId || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '35%' }]}>
          <Text>{formData.itemSerialNo || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '20%' }]}>
          <Text>{ticket?.detectedByUserName || <EmptyCell />}</Text>
        </View>
      </View>

      {/* 5. row: TESPİT EDİLEN ARIZA / İMZA */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '80%' }]}>
          <Text>TESPİT EDİLEN ARIZA</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '20%' }]}>
          <Text>İMZA</Text>
        </View>
      </View>

      {/* 6. row: description */}
      <View style={[styles.row, styles.veryTallRow]}>
        <View
          style={[
            styles.cell,
            { width: '85%', alignItems: 'flex-start' },
          ]}
        >
          <Text style={styles.leftText}>{formData.description || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '20%' }]}>
          <EmptyCell />
        </View>
      </View>

      {/* 7. row: YÜKLENİCİ FİRMA TARAFINDAN... (full width header) */}
      <View style={styles.row}>
        <View style={[styles.fullRowHeader, { width: '100%' }]}>
          <Text>YÜKLENİCİ FİRMA TARAFINDAN YAPILAN İŞLEMLER</Text>
        </View>
      </View>

      {/* 8. row: ARIZAYA MÜDAHALE EDEN / TARİHLER / SORUMLU PERSONEL */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>ARIZAYA MÜDAHALE</Text>
          <Text>EDEN PERSONEL</Text>
        </View>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>ARIZAYA MÜDAHALE</Text>
          <Text>TARİHİ / SAATİ</Text>
        </View>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>ARIZANIN</Text>
          <Text>GİDERİLDİĞİ TARİH / SAAT</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '25%' }]}>
          <Text>ARIZAYI GİDEREN SORUMLU</Text>
          <Text>YÜKLENİCİ PERSONELİ - ADI SOYADI</Text>
        </View>
      </View>

      {/* 9. row: response values */}
      <View style={[styles.row, styles.tallRow]}>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>
            {ticket?.responsePersonnel?.map((p) => p.displayName).join(', ') || <EmptyCell />}
          </Text>
        </View>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.responseDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.responseResolvedAt) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '25%' }]}>
          <Text>
            {ticket?.responseResolvedPersonnel?.map((p) => p.displayName).join(', ') || (
              <EmptyCell />
            )}
          </Text>
        </View>
      </View>

      {/* 10. row: ARIZAYA İLİŞKİN YAPILAN İŞLEM... / İMZA */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '84%' }]}>
          <Text>ARIZAYA İLİŞKİN YAPILAN İŞLEM VE FAAL EDİLMESİ İÇİN GEREKLİ İHTİYAÇLAR</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '16%' }]}>
          <Text>İMZA</Text>
        </View>
      </View>

      {/* 11. row: actions text */}
      <View style={[styles.row, styles.veryTallRow]}>
        <View
          style={[
            styles.cell,
            { width: '84%', alignItems: 'flex-start' },
          ]}
        >
          <Text style={styles.leftText}>{formData.responseActions || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '16%' }]}>
          <EmptyCell />
        </View>
      </View>

      {/* 12. row: FAALİYET KONTROLÜ header (full width) */}
      <View style={styles.row}>
        <View style={[styles.fullRowHeader, { width: '100%' }]}>
          <Text>FAALİYET KONTROLÜ</Text>
        </View>
      </View>

      {/* 13. row: FAALİYET KONTROLÜNÜ YAPAN / SONUÇ / TARİH / BİRİM KOMUTANI */}
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>FAALİYET KONTROLÜNÜ</Text>
          <Text>YAPAN KULLANICI PERSONELİ</Text>
          <Text>RÜTBE - ADI SOYADI / İMZA</Text>
        </View>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>SONUÇ (FAAL / GAYRİ FAAL)</Text>
          <Text style={{ fontSize: 6 }}>
            (Gayri faal ise gerekçesi ve faaliyet için öneriler
          </Text>
          <Text style={{ fontSize: 6 }}>yazılacaktır – Sözleşme gereklerine göre)</Text>
        </View>
        <View style={[styles.headerCell, { width: '25%' }]}>
          <Text>TARİH / SAAT</Text>
        </View>
        <View style={[styles.headerCell, styles.lastCell, { width: '25%' }]}>
          <Text>BİRİM KOMUTANI</Text>
          <Text>RÜTBE - ADI SOYADI / İMZA</Text>
        </View>
      </View>

      {/* 14. row: activity control values */}
      <View style={[styles.row, styles.tallRow]}>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>{ticket?.activityControlPersonnelName || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>{formData.activityControlResult || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, { width: '25%' }]}>
          <Text>{formatDateTime(formData.activityControlDate) || <EmptyCell />}</Text>
        </View>
        <View style={[styles.cell, styles.lastCell, { width: '25%' }]}>
          <Text>{ticket?.activityControlCommanderName || <EmptyCell />}</Text>
        </View>
      </View>


    </View>
    <View style={{ marginTop: 8, textAlign: 'center' }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>ONAY</Text>
      <Text>{formatDateOnly(new Date())}</Text>
    </View>

    <Text style={styles.pageNumber}>
      {pageNumber} - {totalPages}
    </Text>

    <Text style={styles.pageNumber}>
      {pageNumber} - {totalPages}
    </Text>
  </Page>
);

export const TicketPDFDocument = ({ ticket, formData }) => (
  <Document>
    <TicketPDFPage ticket={ticket} formData={formData} pageNumber={1} totalPages={1} />
  </Document>
);
