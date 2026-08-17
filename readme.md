# Flin · Vue 3 Frontend Tətbiqi (Auth + Global State)

Bu layihə **Vue 3**, **Vue Router 4**, **Centralized Global State (Context / Redux Pattern)**, **JWT Sessiya İdarəetməsi** və **BEM (Block Element Modifier)** metodologiyası ilə hazırlanmış, yüksək keyfiyyətli Developer-First frontend tətbiqidir.

---

## 📌 Checkpoint 1: Navigating with Router & Route Guards (15 Bal)

Bu mərhələdə (`guide.md:L3`, `assestments.md`, `quality__checks.md` sənədlərinə uyğun olaraq) layihənin marşrutlaşdırma infrastrukturu və qorunan səhifələrə icazəsiz girişlərin qarşısını alan qlobal keşişlər (guards) qurulmuşdur:

### 1. Marşrutlaşdırma və Route Kateqoriyaları
* **İctimai Marşrutlar (Public Routes)**:
  * `/` — Əsas ana səhifə, interaktiv marşrut xəritəsi və sistem statusu.
  * `/catalog` — Məhsul və xidmətlər kataloqu (istənilən istifadəçi baxa bilər).
* **Qorunan Marşrutlar (Protected Routes - `meta: { requiresAuth: true }`)**:
  * `/dashboard` — İdarəetmə paneli və reaktiv statistik göstəricilər.
  * `/tasks` — Qlobal tapşırıqlar lövhəsi və iş axını.
  * `/cart` — Səbət, endirim tətbiqi və faktura checkout.
  * `/profile` — İstifadəçi hesabı və sessiya məlumatları.
* **Qonaq Marşrutu (Guest Route - `meta: { requiresGuest: true }`)**:
  * `/login` — Giriş portalı. Daxil olmuş istifadəçilər bu səhifəyə daxil olduqda avtomatik olaraq `/dashboard`-a yönləndirilir.
* **404 Xəta Marşrutu (Catch-All)**:
  * `/:pathMatch(.*)*` — Mövcud olmayan bütün URL-lər xüsusi dizayn edilmiş `/404` (`NotFoundView`) səhifəsinə yönləndirilir.

### 2. Vue Router Navigation Guards (`beforeEach`) Mexanizmi
1. **İcazəsiz Girişlərin Qarşısının Alınması**: Qorunan səhifəyə icazəsiz keçid zamanı keçid bloklanır, `"Giriş Tələb Olunur"` xəbərdarlığı çıxır və istifadəçi `/login?redirect=${to.fullPath}` ünvanına yönləndirilir.
2. **Girişdən Sonra Qayıdış**: Uğurlu girişdən sonra istifadəçi avtomatik olaraq ilk cəhd etdiyi `redirect` səhifəsinə qaytarılır.
3. **Dinamik Səhifə Başlıqları**: SEO və UX üçün `document.title` hər səhifə dəyişdikdə dinamik yenilənir.

---

## 📌 Checkpoint 2: Authentication Flow & Session Protection (20 Bal)

Bu mərhələdə (`guide.md:L4`) təhlükəsiz və sənaye standartlarına uyğun autentifikasiya axını reallaşdırılmışdır:

### 1. Validasiyalı Giriş Forması (`src/views/LoginView.js`)
* **Real-vaxt Sahə Doğrulaması**: Email regex yoxlanışı, minimum 6 simvollu şifrə tələbi və sahəaltı xəta mesajları.
* **UX Xüsusiyyətləri**: Şifrəni göstər/gizlət düyməsi, asinxron yüklənmə spineri və 1 kliklə test preseti (**Sarah - Architect**, **Alex - Lead Dev**, **Elena - PM**).
* **"Məni xatırla" (Remember Me)**: 7 günlük uzadılmış JWT sessiyası və ya 1 saatlıq standart sessiya seçimi.

### 2. Standart 3 Hissəli JWT İdarəetməsi (`src/utils/token.js`)
* **Header**, **Payload Claims** (`sub`, `email`, `role`, `permissions`, `iat`, `exp`, `jti`) və **Signature** Base64Url formatlı JWT tokenlər.
* Səhifə yeniləndikdə (`F5` / Refresh) `localStorage`-dən (`flin_auth_token`) sessiyanın itkisiz bərpası.

### 3. Quality Checks Tələblərinin İcrası:
* **Quality Check 1 (401 Interceptor Simulyasiyası)**: `apiClient.js` daxilində 401 xətası aşkar edildikdə sessiyanı sonlandırır və qəzasız/dövrəsiz `/login?redirect=...&reason=401_expired` səhifəsinə yönləndirir.
* **Quality Check 3 (Təmiz Çıxış və Back Button Qoruması)**: Çıxış zamanı bütün tokenlər və `localStorage` sıfırlanır, geri düyməsi ilə qorunan səhifələrə daxil olmağa imkan verilmir.

---

## 📌 Checkpoint 3: Global State Management (Context / Redux Pattern) (20 Bal)

Bu mərhələdə (`guide.md:L5`, `assestments.md`, `quality__checks.md` sənədlərinə uyğun olaraq) layihə üçün mərkəzləşdirilmiş **Global State Store & Redux / Reducer Dispatcher** arxitekturası qurulmuşdur:

### 1. Mərkəzləşdirilmiş Qlobal Store Arxitekturası (`src/state/index.js`)
* **Mərkəzi Dispatcher**: `store.dispatch({ type, payload })` vasitəsilə vahid action yönləndirilməsi və reducer emalı.
* **Middleware Logging & State Snapshot**: Hər dispatch olunan action üçün əvvəlki/sonrakı vəziyyət qeydiyyatı və tarixçə axını (`actionHistory`).
* **Slices Sistemi**:
  * **Auth Slice (`authStore.js`)**: İstifadəçi autentifikasiyası, JWT token, sessiya TTL və icazələr.
  * **Cart Slice (`src/state/slices/cartSlice.js`)**: Səbət məhsulları, kəmiyyət tənzimləməsi (`+/-`), promo kod tətbiqi (`FLIN2026` 15%, `DEVJOINT50` 50%), 18% ƏDV hesablanması və `localStorage` sinxronizasiyası.
  * **Tasks Slice (`src/state/slices/taskSlice.js`)**: Tapşırıqların yaradılması, status toggle, silinmə, çoxlu tamamlama (bulk complete), status/axtarış/prioritet filtrləri və statistika hesablaması.
  * **Toast Slice (`src/state/slices/toastSlice.js`)**: Qlobal floating bildiriş sistemi (success, info, warning, danger).

---

### 2. Quality Check 2: Stale Closure vs Fresh Reducer Dispatch Diaqnostikası
* **Problem**: React/Vue-da callback və asinxron funksiyalarda closure daxilində köhnə (stale) dəyərin yadda qalması klassik frontend problemidir.
* **Həll və Test**: `/tasks` səhifəsində və DevTools-da xüsusi **"Stale Closure vs Fresh Reducer Dispatch"** test modulu yaradılmışdır. Modul asinxron gecikmə zamanı köhnə closure dəyəri ilə Reducer store-un təmin etdiyi təzə vəziyyəti canlı müqayisə edərək testin keçdiyini sübut edir.

---

### 3. Redux DevTools Tipli State Inspector (`src/components/StateInspector.js`)
* Ekranın aşağı sağ küncündə yerləşən interaktiv DevTools paneli:
  * **State Tree**: Bütün tətbiqin qlobal JSON vəziyyət ağacı (Auth, Cart, Tasks, Toasts).
  * **Action Log**: Real-vaxt rejimində axan action axını, zaman damğası və payload məlumatları.
  * **Manual Dispatcher**: İstənilən action-ı JSON formatında əl ilə göndərmək imkanı.
  * **Sürətli Test Düymələri**: Bir kliklə səbətə məhsul atmaq, tapşırıq yaratmaq və ya promo kod yoxlamaq.

---

### 4. Qlobal Toast Bildiriş Sistemi (`src/components/ToastContainer.js`)
* Tətbiqin istənilən yerindən dispatch olunan hərəkətlərə (məs: "Məhsul səbətə əlavə edildi", "Promo kod tətbiq edildi", "Tapşırıq silindi") uyğun olaraq sağ yuxarı küncdə animasiyalı və avtomatik itən toast-lar göstərilir.

---

## 💎 BEM (Block Element Modifier) CSS Naming Sistemi

Layihədə bütün vizual elementlər və CSS dərhal oxunaqlı və modulyar olan **BEM** standartı ilə yazılmışdır:

| Tip | Nümunə | Təsviri |
| :--- | :--- | :--- |
| **Bloklar (Block)** | `.app-header`, `.state-inspector`, `.cart-card`, `.task-item`, `.toast-container` | Müstəqil funksional komponent vahidləri |
| **Elementlər (Element)** | `.cart-card__name`, `.task-item__title`, `.state-inspector__tab`, `.toast-item__msg` | Blokun daxilindəki tərkib hissələri (`__` ilə ayrılır) |
| **Modifikatorlar (Modifier)** | `.btn--solid`, `.task-tab--active`, `.toast-item--success`, `.badge--protected` | Vəziyyət və ya görünüş dəyişiklikləri (`--` ilə ayrılır) |

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
│   │   ├── index.js           # Mərkəzləşdirilmiş Global Store & Redux Dispatcher
│   │   ├── authStore.js       # Reaktiv Auth Store və JWT idarəetməsi
│   │   └── slices/
│   │       ├── cartSlice.js   # Shopping Cart Slice (qiymət, vergi, kupon, persistence)
│   │       ├── taskSlice.js   # Task Manager Slice (CRUD, filtrlər, Stale Closure testi)
│   │       └── toastSlice.js  # Global Toast Notifications Slice
│   ├── services/
│   │   └── apiClient.js       # Mock API Client & 401 Response Interceptor
│   ├── utils/
│   │   └── token.js           # JWT Kodlaşdırma, Dekodlaşdırma və Vaxt hesablama utilitləri
│   ├── components/
│   │   ├── AppHeader.js       # Başlıq paneli, dinamik səbət və tapşırıq sayğacları
│   │   ├── ToastContainer.js  # Qlobal toast bildiriş konteyneri
│   │   ├── StateInspector.js  # Redux DevTools State & Action Inspector
│   │   ├── SessionInspector.js# Canlı JWT və Sessiya test konsolu
│   │   ├── RouteBanner.js     # Keçid bildiriş banneri
│   │   └── AppFooter.js       # Footer komponenti
│   └── views/
│       ├── HomeView.js        # İctimai ana səhifə və route guard xəritəsi
│       ├── CatalogView.js     # İctimai məhsul kataloqu və səbətə birbaşa əlavə (/catalog)
│       ├── LoginView.js       # Validasiyalı giriş və demo hesablar (/login)
│       ├── DashboardView.js   # Qorunan idarəetmə paneli və canlı statistika (/dashboard)
│       ├── TasksView.js       # Qorunan tapşırıqlar lövhəsi və Stale Closure Lab (/tasks)
│       ├── CartView.js        # Qorunan səbət, promo kod və faktura checkout (/cart)
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

## 🧪 Qiymətləndirmə üçün Canlı Test Ssenariləri

### Checkpoint 1 & 2 Testləri:
1. **Qorunan Səhifə Testi**: Sistemə daxil olmadan `/dashboard`-a daxil olmağa çalışın → `/login?redirect=%2Fdashboard` yönləndirməsi baş verir.
2. **Validasiyalı Giriş**: Hazır "Sarah (Architect)" hesabı ilə daxil olun → Dashboard açılır.
3. **Session Persistence (F5)**: Səhifəni yeniləyin → Sessiya qorunur və istifadəçi daxil olmuş qalır.
4. **401 Interceptor**: Session Inspector panelində `⚡ 401 Simulyasiya Et` düyməsinə klikləyin → Qəzasız login redirecti baş verir.

### Checkpoint 3 (Global State) Testləri:
1. **Kataloqdan Səbətə Əlavə**: `/catalog` səhifəsində istənilən məhsulun üzərindəki **"Səbətə Əlavə Et +"** düyməsinə klikləyin → Başlıqdakı səbət sayğacı dərhal artır və sağ yuxarıda yaşıl Toast bildirişi çıxır.
2. **Səbət Hesablamaları və Promo Kod**: `/cart` səhifəsinə keçin, məhsulların sayını `+` və `-` ilə dəyişin → Subtotal, 18% ƏDV və Grand Total real-vaxtda yenilənir. Promo kod xanasına `FLIN2026` yazıb tətbiq edin → 15% endirim avtomatik çıxılır.
3. **Tapşırıqlar İdarəetməsi (CRUD & Filtrlər)**: `/tasks` səhifəsində yeni tapşırıq əlavə edin, statusunu dəyişin, "Hamısını Tamamla" düyməsini yoxlayın, Axtarış və Tab filtrlərini test edin.
4. **Quality Check 2 (Stale Closure Lab)**: `/tasks` səhifəsinin altındakı **"⚡ Stale Closure Testini İcra Et"** düyməsinə klikləyin → Asinxron closure dəyəri ilə Reducer store-un təzə vəziyyəti müqayisə olunur və uğurlu test loqu çıxır.
5. **Redux DevTools Inspector**: Ekranın sağ aşağı küncündəki **"⚡ Redux State DevTools"** düyməsinə klikləyin → Bütün State Tree-yə və dispatch olunmuş Action-ların axınına canlı baxın.
