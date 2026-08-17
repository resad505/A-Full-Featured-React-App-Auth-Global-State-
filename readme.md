# Flin · Vue 3 Frontend Tətbiqi (Checkpoint 2: Authentication Flow)

Bu layihə **Vue 3**, **Vue Router 4**, **JWT (JSON Web Token) Sessiya İdarəetməsi** və **BEM (Block Element Modifier)** metodologiyası ilə hazırlanmış, yüksək keyfiyyətli Developer-First frontend tətbiqidir.

---

## 📌 Checkpoint 2: İcra Olunmuş İşlər və Nəticələr (20 Bal)

Bu mərhələdə (`guide.md:L4`, `assestments.md`, `quality__checks.md` sənədlərinə uyğun olaraq) tam və təhlükəsiz **Autentifikasiya Axını (Authentication Flow)** reallaşdırılmışdır:

### 1. Təkmilləşdirilmiş Giriş Forması (`src/views/LoginView.js`)
* **Real-vaxt Form Doğrulaması (Validation)**:
  * Email formatı yoxlanışı (Regex).
  * Şifrənin minimum 6 simvol uzunluğu tələbi.
  * Hər sahə üçün xüsusi vizual xəta bildirişləri (`.auth-form__error-msg`).
* **İstifadəçi Təcrübəsi (UX)**:
  * Şifrəni göstər/gizlət düyməsi (`auth-form__toggle-pwd`).
  * Şəbəkə gecikməsini simulyasiya edən asinxron yüklənmə spineri (`.spinner`) və `disabled` submit düyməsi.
  * Sürətli test üçün hazır hesab seçiciləri (**Sarah - Architect**, **Alex - Lead Dev**, **Elena - PM**).
  * **"Məni xatırla" (Remember Me)**: 7 günlük uzadılmış JWT sessiyası və ya 1 saatlıq standart sessiya seçimi.
* **Redirect & 401 Xəbərdarlığı**:
  * Qorunan marşrutdan və ya 401 sessiya bitməsindən yönləndirildikdə istifadəçiyə dəqiq kontekstual bildiriş göstərilir.

---

### 2. JWT Token Strukturu və Saxlanması (`src/utils/token.js` & `src/state/authStore.js`)
* **3 Hissəli Base64Url Standart JWT Generator**:
  * **Header**: `{ "alg": "HS256", "typ": "JWT" }`
  * **Payload**: `{ "iss": "flin-auth-service", "sub": "usr_...", "email": "...", "displayName": "...", "role": "...", "permissions": [...], "iat": 1771322700, "exp": 1771326300, "jti": "jwt_..." }`
  * **Signature**: Təhlükəsiz mock imza şifrələnməsi.
* **Token İdarəetmə Funksiyaları**:
  * `createMockJwt()` — Xüsusi TTL (Time To Live) ilə token yaradılması.
  * `decodeJwt()` — Brauzer səviyyəsində payload və header-in dərhal oxunması.
  * `isTokenExpired()` — Tokenin son istifadə vaxtının cari vaxtla müqayisəsi.
  * `getTokenRemainingSeconds()` — Sessiyanın bitməsinə qalan saniyələrin hesablanması.

---

### 3. Səhifə Yeniləndikdə Sessiyanın Qorunması (Session Protection on Refresh)
* İstifadəçi qorunan səhifələrdə (`/dashboard`, `/tasks`, `/cart`, `/profile`) olarkən səhifəni yenilədikdə (`F5` və ya `Ctrl+R`):
  * `authStore` dərhal `localStorage`-dən (`flin_auth_token`, `flin_user_data`) məlumatları bərpa edir.
  * Tokenin etibarlılığı yoxlanılır; əgər vaxtı keçməyibsə, istifadəçi login-ə atılmadan olduğu qorunan səhifədə qalır.
  * Əgər tokenin vaxtı bitibsə, sessiya təmizlənir və istifadəçi `/login?redirect=...&reason=401_expired` ünvanına yönləndirilir.

---

### 4. Təmiz Çıxış və Vəziyyət Sıfırlanması (Quality Check 3)
* İstifadəçi çıxış etdikdə (`logout`):
  * `authStore.state.token = null`, `user = null` və reaktiv taymer dayandırılır.
  * `localStorage`-dən bütün həssas açarlar (`flin_auth_token`, `flin_user_data`, `flin_remember_me`) tam silinir.
  * Brauzerin "Geri" (Back) düyməsi ilə qorunan səhifəyə qayıtmaq cəhdi router guard tərəfindən bloklanır və yenidən giriş tələb olunur.

---

### 5. Mock API Interceptor və 401 Token Expiration Simulyasiyası (Quality Check 1)
* `src/services/apiClient.js` daxilində tam Request və Response interceptor arxitekturası qurulmuşdur:
  * **Request**: Hər sorğuya avtomatik `Authorization: Bearer <token>` əlavə edir.
  * **Response**: `401 Unauthorized` cavabı aşkar edildikdə avtomatik olaraq sessiyanı sonlandırır, bildiriş qoyur və heç bir sonsuz dövrə (infinite loop) və ya tətbiq qəzası (crash) yaratmadan login səhifəsinə yönləndirir.

---

### 6. İnteraktiv Token & Session Inspector (`src/components/SessionInspector.js`)
Dashboard və Profil səhifələrinə inteqrasiya edilmiş xüsusi test konsolu vasitəsilə:
* Canlı JWT Header və Payload iddialarını (Claims) JSON formatında görmək mümkündür.
* Sessiyanın bitməsinə qalan vaxt canlı saniyəbəsaniyə taymerlə göstərilir.
* **Interaktiv Düymələr**:
  * 🔄 **"Tokeni Yenilə (Refresh)"** — Mövcud istifadəçi üçün yeni JWT yaradır və vaxtı uzadır.
  * ⚡ **"401 Xətasını Simulyasiya Et"** — Interceptor-un işləməsini və qəzasız login redirectini test edir.
  * ⏳ **"Müddəti Bitir (Force Expire)"** — Tokenin vaxtını süni şəkildə keçmişə çəkir.
  * 🚪 **"Təmiz Çıxış (Wipe Storage)"** — Bütün həssas sessiya məlumatlarını dərhal silir.

---

## 💎 BEM (Block Element Modifier) CSS Naming Sistemi

Layihədə bütün vizual elementlər və CSS dərhal oxunaqlı və modulyar olan **BEM** standartı ilə yazılmışdır:

| Tip | Nümunə | Təsviri |
| :--- | :--- | :--- |
| **Bloklar (Block)** | `.app-header`, `.session-inspector`, `.auth-form`, `.inspector-card` | Müstəqil funksional komponent vahidləri |
| **Elementlər (Element)** | `.auth-form__input`, `.session-inspector__ttl`, `.demo-presets__label` | Blokun daxilindəki tərkib hissələri (`__` ilə ayrılır) |
| **Modifikatorlar (Modifier)** | `.btn--solid`, `.btn--danger-ghost`, `.storage-tag--active`, `.badge--protected` | Vəziyyət və ya görünüş dəyişiklikləri (`--` ilə ayrılır) |

---

## 📂 Qovluq və Fayl Strukturu

```text
├── index.html                 # Əsas HTML şablonu (Outfit & JetBrains Mono şriftləri)
├── package.json               # Vue 3, Vue Router 4 və Vite konfiqurasiyası
├── vite.config.js             # Vite dev server konfiqurasiyası
├── styles.css                 # BEM metodologiyası ilə yazılmış tam CSS dizayn sistemi
├── src/
│   ├── main.js                # Vue tətbiqinin bootstrap və router quraşdırılması
│   ├── router/
│   │   └── index.js           # Vue Router marşrutları və Navigation Guards (beforeEach)
│   ├── state/
│   │   └── authStore.js       # Reaktiv Auth Store, JWT idarəetməsi və taymer
│   ├── services/
│   │   └── apiClient.js       # Mock API Client & 401 Response Interceptor
│   ├── utils/
│   │   └── token.js           # JWT Kodlaşdırma, Dekodlaşdırma və Vaxt hesablama utilitləri
│   ├── components/
│   │   ├── AppHeader.js       # Başlıq paneli və sessiya indikatoru
│   │   ├── SessionInspector.js# Canlı JWT və Sessiya test konsolu
│   │   ├── RouteBanner.js     # Keçid bildiriş banneri
│   │   └── AppFooter.js       # Footer komponenti
│   └── views/
│       ├── HomeView.js        # İctimai ana səhifə və route guard xəritəsi
│       ├── CatalogView.js     # İctimai məhsul kataloqu (/catalog)
│       ├── LoginView.js       # Validasiyalı giriş və demo hesablar (/login)
│       ├── DashboardView.js   # Qorunan idarəetmə paneli (/dashboard)
│       ├── TasksView.js       # Qorunan tapşırıqlar lövhəsi (/tasks)
│       ├── CartView.js        # Qorunan səbət bölməsi (/cart)
│       ├── ProfileView.js     # Qorunan profil və JWT parametrləri (/profile)
│       └── NotFoundView.js    # 404 Tapılmayan səhifə marşrutu (/404)
├── readme.md                  # Layihə sənədləşməsi
├── guide.md                   # Ümumi tələblər bələdçisi
├── assestments.md             # Qiymətləndirmə meyarları
└── quality__checks.md         # Keyfiyyət yoxlama meyarları
```

---

## 🚀 Layihəni İşə Salma və Yoxlama Qaydası

### 1. Asılılıqları Quraşdırın:
```bash
npm.cmd install
```

### 2. İnkişaf Serverini Başladın:
```bash
npm.cmd run dev
```
Tətbiq avtomatik olaraq `http://localhost:3000/` ünvanında açılacaqdır.

### 3. Production Build Testi:
```bash
npm.cmd run build
```

---

## 🧪 Qiymətləndirmə üçün Canlı Test Ssenariləri (Checkpoint 2)

1. **Giriş və Validasiya Testi**:
   * `/login` səhifəsinə keçin, səhv formatda email və ya qısa şifrə daxil edin → Sahələrin altında qırmızı xəta mesajları görünəcək.
   * Hazır **"Architect (Sarah)"** düyməsinə klikləyin → Forma dərhal doldurulur.
   * "Daxil Ol" düyməsinə klikləyin → Yüklənmə spineri çıxır və `/dashboard` səhifəsinə yönləndirilir.

2. **Səhifə Yenilənməsi Testi (Session Persistence on Refresh)**:
   * `/dashboard` və ya `/profile` səhifəsində olarkən brauzerdə səhifəni yeniləyin (`F5`).
   * *Nəticə*: İstifadəçi qorunan səhifədə qalır, `localStorage`-dən token bərpa olunur və reaktiv taymer davam edir.

3. **401 Xəta Simulyasiyası (Quality Check 1)**:
   * Dashboard və ya Profil səhifəsindəki Session Inspector panelində **"⚡ 401 Xətasını Simulyasiya Et"** düyməsinə klikləyin.
   * *Nəticə*: `apiClient` interceptor-u 401 cavabını tutur, tətbiq çökmədən və dövrəyə düşmədən istifadəçini `🔒 401 Sessiya Müddəti Bitdi` bildirişi ilə `/login?redirect=...` səhifəsinə yönləndirir.

4. **Təmiz Çıxış və Back Button Qoruması (Quality Check 3)**:
   * Başlıqdakı və ya paneldəki **"Çıxış"** düyməsinə klikləyin.
   * *Nəticə*: Bütün tokenlər və `localStorage` sıfırlanır. Brauzerin "Geri" (Back) düyməsinə kliklədikdə qorunan səhifə açılmır, login səhifəsinə istiqamətləndirilir.
