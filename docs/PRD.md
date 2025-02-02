## **Product Requirements Document (PRD)**

### **Proje Adı**: Bingo Etkinlik Uygulaması

### **Proje Özeti**:
Bu uygulama, etkinliklerde katılımcıların birbirlerini tanıması ve etkileşime girmesi amacıyla bir Bingo oyunu sağlar. Her etkinlik için özelleştirilmiş kartlar oluşturulur, katılımcılar bu kartlarda yer alan soruları yanıtlar ve belirli kurallar dahilinde etkileşimde bulunurlar. Etkinlik sonunda, katılımcılar QR kodları aracılığıyla görevlerin tamamlandığını kanıtlar. Kartlar, süreli ve süresiz modlar üzerinden oynanabilir ve her kart belirli puanlarla değerlendirilir.

---
### **1. Kullanıcı Hikayeleri (User Stories)**

1. **Etkinlik Oluşturma (Admin):**
   - Admin olarak, bir etkinlik oluşturabilmeliyim, böylece katılımcılar bu etkinliğe katılabilir.
   - Etkinlik adı, açıklaması, katılımcı sayısı ve kartlar gibi bilgiler belirlenebilir.
   - Admin olarak, etkinliğe katılacak kişilerin kartlara dahil olacağı soruları seçebilmeliyim.

2. **Etkinlik Katılımı (Katılımcılar):**
   - Katılımcılar olarak, etkinlik oluşturulan Bingo oyununa katılabilmeliyim.
   - Her katılımcı, kartlarda yer alan 5 soruyu yanıtlamalıdır.
   - Karttaki her soruya tıkladığında, o soruyu yanıtlayan kişilerin profil resimleri gösterilmelidir.

3. **Kart Yanıtları ve Profil Resimleri:**
   - Katılımcılar, karttaki sorulara tıklayarak, o soruyu yanıtlayan kişilerin profil resimlerini görebilmelidir.
   - Katılımcılar, kartta yanıtladıkları sorulara dair kendi QR kodlarını oluşturabilmelidir.

4. **QR Kod Sistemi:**
   - Katılımcılar, QR kodlarını kullanarak kartlarındaki görevlerin yerine getirildiğini kanıtlayabilmelidir.
   - Diğer katılımcılar, QR kodunu okutarak, o kartın tamamlandığını teyit edebilir.

5. **Oyun Modları ve Süreli/Süresiz Seçenekler:**
   - Etkinlikler, süreli veya süresiz olarak oynanabilir.
   - Süreli modda, katılımcılar belirli bir süre içinde kartlarını tamamlamaya çalışırlar.
   - Süresiz modda ise katılımcılar istedikleri kadar zaman harcayabilirler.

6. **Bingo Kartları ve Puan Sistemi:**
   - Kartlar 5x5'lik grid yapısında olacak.
   - Her kartta 25 soru olacak, her soru bir katılımcıya ait olacak.
   - Kartlar 4 puan değerinde olacak, her kart 100 puan üzerinden değerlendirilecektir.

7. **Etkinlik Sonuçları ve Liderlik Tablosu:**
   - Kartlarını tamamlayan katılımcılar Bingo yapacaklar.
   - Etkinlik sonunda, kazananlar, tamamladıkları kartlar ve topladıkları puanlarla görüntülenebilir.

---

### **2. Gereksinimler ve Özellikler**

#### **Fonksiyonel Gereksinimler:**
1. **Admin Paneli:**
   - Etkinlik oluşturma
   - Kartları yönetme (soruları ekleme, düzenleme, kaldırma)
   - Katılımcı sayısı belirleme ve yönetme
   - Etkinlik takibi

2. **Katılımcı Paneli:**
   - Etkinliklere katılma ve profili oluşturma
   - Kartlarda soruları yanıtlayabilme
   - QR kodlarını görüntüleyebilme
   - Diğer katılımcıların QR kodlarını okutarak görevlerin yerine getirilip getirilmediğini teyit etme

3. **Bingo Kartları:**
   - 5x5 kart yapısı
   - Her kartta yer alan soruların dinamik olarak yönetilmesi
   - Her kartta yer alan sorulara tıklanarak, yanıtlayan kişilerin profil resimlerinin gösterilmesi

4. **QR Kod Sistemi:**
   - Her kartın yanıtlanan sorularına özel QR kodları oluşturulması
   - Katılımcıların QR kodlarını okutarak görevin tamamlandığını kanıtlaması

5. **Puan ve Zorluk Seviyeleri:**
   - Kartlar 4 puan değerinde olacak
   - Süreli ve süresiz mod seçenekleri
   - Kartların tamamlanma durumuna göre anlık puan hesaplaması

6. **Lider Tablosu:**
   - Kazananları ve en hızlı Bingo yapanları göstermek
   - Kartları tamamlayan kişilerin sıralandığı bir lider tablosu

---

### **3. Teknik Gereksinimler**

#### **Veritabanı Tasarımı:**
- **Kullanıcılar:** Kullanıcı bilgileri (isim, avatar, etkinlik kartları, QR kodları)
- **Etkinlikler:** Etkinlik adı, açıklaması, katılımcı listesi, kartlar
- **Kartlar:** Her kartta 25 soru, katılımcılara ait profil bilgileri ve QR kodları
- **QR Kodları:** Her kart için dinamik olarak oluşturulacak QR kodları

#### **API Gereksinimleri:**
- **Kullanıcı Yönetimi:** Kullanıcıların kaydolması, giriş yapması, profillerinin güncellenmesi
- **Etkinlik Yönetimi:** Etkinlik oluşturma, katılımcı ekleme, kartların yönetilmesi
- **Kart Yönetimi:** Kartları oluşturma, soruları ekleme, cevapları kaydetme
- **QR Kod Yönetimi:** Dinamik QR kod üretimi ve doğrulama
- **Bingo Durumu:** Kartın tamamlanma durumu, puan hesaplama

---

### **4. Kullanıcı Arayüzü (UI)**
1. **Admin Paneli:**
   - Etkinlik oluşturma ve düzenleme sayfası
   - Katılımcı yönetimi
   - Kart yönetim sayfası

2. **Katılımcı Paneli:**
   - Etkinliklerin listesi ve katılım butonu
   - Kartları yanıtlamak için kullanıcı arayüzü
   - QR kodları ve görev doğrulama ekranı
   - Bingo durumu ve puan görüntüleme

3. **QR Kodları:**
   - QR kodu görüntüleme ve okuma ekranları
   - Profil resimleri ve görevi tamamlayan kişilerin listesi

---

Teknoloji Stack Özeti:
Frontend: React.js, Next.js, Tailwind CSS, React Query, Axios
Backend: Firebase Authentication, Firebase Firestore, Firebase Functions
Depolama: Supabase Storage
Dağıtım: Vercel
Versiyon Kontrolü: GitHub/GitLab
API Testi: Postman
