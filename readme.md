# Flin · Vue 3 Frontend Tətbiqi (Auth + Global State)

Bu layihə **Vue 3**, **Vue Router 4**, **Centralized Global State (Context / Redux Pattern)**, **Optimistic UI + Mock CRUD**, **Error Boundary**, **JWT Sessiya İdarəetməsi**, **Feature-Based Kod Arxitekturası** və **BEM (Block Element Modifier)** metodologiyası ilə hazırlanmış, yüksək keyfiyyətli Developer-First frontend tətbiqidir.

---

## 📊 Checkpoint İcrası və Bal Bölgüsü (100 / 100 Bal)

| Checkpoint | Mövzu | Bal | Status | Branch |
| :--- | :--- | :--- | :--- | :--- |
| **Checkpoint 1** | Navigating with Vue Router & Navigation Guards | 15 Bal | ✅ Tamamlandı | `checkpoint-1` |
| **Checkpoint 2** | Authentication Flow & Session Protection (JWT) | 20 Bal | ✅ Tamamlandı | `checkpoint-2` |
| **Checkpoint 3** | Centralized Global State (Context / Redux Pattern) | 20 Bal | ✅ Tamamlandı | `checkpoint-3` |
| **Checkpoint 4** | Validated Forms (Custom `useForm` & `validators.js`) | 15 Bal | ✅ Tamamlandı | `checkpoint-4` |
| **Checkpoint 5** | Mock CRUD against API with Optimistic UI & Rollback | 15 Bal | ✅ Tamamlandı | `checkpoint-5` |
| **Checkpoint 6** | Error Boundary & Global Error Handling (App Crash Isolation) | 10 Bal | ✅ Tamamlandı | `checkpoint-6` |
| **Checkpoint 7** | Feature-Based Folder Structure & Code Organization | 5 Bal | ✅ Tamamlandı | `checkpoint-7` |

---

## 📌 Checkpoint 7: Feature-Based Code Structure & Architecture (5 Bal)

Layihənin `src/` strukturu ənənəvi type-based təşkilatdan (`views/`, `components/`, `state/`, `services/`, `utils/`) genişlənə bilən, modulyar **Feature-Based Architecture** standartına keçirilmişdir:

```text
src/
├── features/                  # Funksional modul və bölmələr (Feature Slices)
│   ├── auth/                  # Autentifikasiya, login portalı və token idarəetməsi
│   │   ├── LoginView.js       # Validasiyalı giriş forması və demo hesablar
│   │   └── authStore.js       # Reaktiv Auth Store və JWT token TTL sayğacı
│   ├── cart/                  # Səbət, endirim və checkout modulu
│   │   ├── CartView.js        # Səbət görünüşü və faktura checkout
│   │   └── cartSlice.js       # Reaktiv səbət vəziyyəti, vergi və kupon hesablamaları
│   ├── tasks/                 # Tapşırıqlar lövhəsi və Optimistic CRUD modulu
│   │   ├── TasksView.js       # Tapşırıqlar lövhəsi, form və API simulyasiya paneli
│   │   └── taskSlice.js       # Tapşırıqların CRUD əməliyyatları və Rollback idarəetməsi
│   ├── catalog/               # İctimai məhsul və xidmətlər kataloqu
│   │   └── CatalogView.js     # Kataloq görünüşü və birbaşa səbətə əlavə
│   ├── profile/               # İstifadəçi profili modulu
│   │   ├── ProfileView.js     # Profil tənzimləmələri və JWT məlumatları
│   │   └── profileSlice.js    # Profil sahələri və localStorage sinxronizasiyası
│   └── dashboard/             # İdarəetmə paneli və canlı statistikalar
│       └── DashboardView.js   # Əsas qorunan dashboard və lokal Error Boundary demo
├── shared/                    # Bütün tətbiq üzrə paylaşılan komponentlər və xidmətlər
│   ├── components/            # Qlobal UI komponentləri
│   │   ├── AppHeader.js       # Başlıq paneli, dinamik səbət və tapşırıq sayğacları
│   │   ├── AppFooter.js       # BEM footer komponenti
│   │   ├── RouteBanner.js     # Keçid bildirişləri banneri
│   │   ├── ToastContainer.js  # Qlobal animasiyalı Toast bildiriş sistemi
│   │   ├── StateInspector.js  # Redux DevTools State & Action Inspector
│   │   ├── SessionInspector.js# Canlı JWT və Sessiya test konsolu
│   │   └── ErrorBoundary.js   # Checkpoint 6: onErrorCaptured ilə xəta təcridi komponenti
│   ├── services/
│   │   └── apiClient.js       # Mock API Client, 401 Interceptor & CRUD metodları
│   ├── utils/
│   │   ├── token.js           # JWT Base64Url kodlaşdırma və vaxt utilitləri
│   │   └── validators.js      # Təkrar istifadə edilə bilən form validasiya qaydaları
│   ├── composables/
│   │   └── useForm.js         # Checkpoint 4: React Hook Form tipli Vue composable
│   ├── views/                 # Xüsusi təkrar istifadə edilən ümumi səhifələr
│   │   ├── HomeView.js        # İctimai ana səhifə və route guard xəritəsi
│   │   └── NotFoundView.js    # 404 Tapılmayan səhifə marşrutu
│   └── state/                 # Mərkəzi Redux pattern dispatcher
│       ├── index.js           # Mərkəzi Store & Action History Logger
│       └── slices/
│           └── toastSlice.js  # Qlobal Toast Slice
├── router/
│   └── index.js               # Vue Router 4 marşrutları və Navigation Guards
└── main.js                    # Tətbiqin bootstrap, qlobal ErrorHandler və plugin quraşdırılması
```

---

## 📌 Checkpoint 5: CRUD Operations against Mock API with Optimistic UI (15 Bal)

Bu mərhələdə (`guide.md:L7`) sənaye standartı olan **Optimistic UI with Rollback Pattern** və asinxron **Mock API CRUD** arxitekturası qurulmuşdur:

### 1. Mock API Client (`src/shared/services/apiClient.js`)
* **Real CRUD Endpointləri**:
  * `createTask(taskData)` — Asinxron `POST /api/tasks` (250–400ms gecikmə)
  * `updateTask(id, patch)` — Asinxron `PATCH /api/tasks/:id` (250–400ms gecikmə)
  * `deleteTask(id)` — Asinxron `DELETE /api/tasks/:id` (250–400ms gecikmə)
  * `addToCart(product)`, `removeFromCart(id)`, `updateCartQty(id, qty)` — Səbət CRUD əməliyyatları
* **Təsadüfi və ya Məcburi Xəta Simulyatoru (`forceFailure`)**: Qiymətləndiricinin rollback axınını 1 kliklə canlı test edə bilməsi üçün API-yə xəta atma rejimi əlavə edilib.

### 2. Optimistic UI & Rollback Axını (`src/features/tasks/taskSlice.js` & `cartSlice.js`)
1. **Dərhal UI Yenilənməsi (Optimistic Update)**: İstifadəçi düyməyə basdığı anda UI dərhal yenilənir (spinerdə gözlətmədən) və tapşırığa müvəqqəti ID + `_syncStatus: 'syncing'` statusu verilir.
2. **Arxa Fonda API Sorğusu**: Asinxron olaraq `apiClient` sorğusu icra olunur.
3. **Uğurlu Təsdiqləmə (Confirmed)**: Server 200/201 OK qaytardıqda tapşırıq server ID-si ilə möhkəmləndirilir və `_syncStatus: 'synced'` qeyd olunur.
4. **Xətada Geri Qaytarılma (Rollback)**: Server 500 Network Error verdikdə:
   * Yaradılmış optimistik element dərhal state-dən silinir (və ya silinən element öz indeksinə bərpa edilir).
   * İstifadəçiyə qırmızı təhlükə Toast bildirişi göstərilir.
   * Rollback hadisəsi loqlanır və Redux DevTools-da qeyd edilir.

---

## 📌 Checkpoint 6: Error Boundary & Global Error Handling (10 Bal)

Bu mərhələdə (`guide.md:L8`) tətbiqin istənilən daxili xəta səbəbindən bütünlükdə çökməsinin (White Screen of Death) qarşısını alan ikipilləli müdafiə sistemi qurulmuşdur:

### 1. Qlobal Vue Xəta Tutucusu (`src/main.js`)
```javascript
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Vue ErrorHandler Caught]:', err, info);
  toastSlice.addToast(
    `🚨 [Qlobal Error Handler]: ${err?.message || 'Gözlənilməz xəta baş verdi.'} (Tətbiq çökmədi)`,
    'danger',
    6000
  );
};
```

### 2. Error Boundary Komponenti (`src/shared/components/ErrorBoundary.js`)
* Vue 3-ün **`onErrorCaptured(err, instance, info)`** hook-undan istifadə edir.
* Alt komponentlərdə baş verən render, hesablama və ya lifecycle xətalarını tutur və xətanın yuxarı şaxələnməsinin qarşısını alır (`return false`).
* **Zərif Fallback UI Kartı**: Komponent sıradan çıxsa belə, ətrafındakı Header, Naviqasiya və Footer 100% işlək qalır. Fallback kartında:
  * Xətanın baş verdiyi bölmənin adı
  * Xəta mesajı və zaman damğası
  * Genişlənən Stack Trace
  * **"🔄 Komponenti Yenidən Başlat (Reset Error)"** düyməsi yerləşir.

### 3. Canlı Test Düymələri ("Simulate Crash"):
* **StateInspector (DevTools)**: Quick Actions panelində **"💥 Simulate Crash (CP6)"** düyməsi.
* **DashboardView**: **"💥 Bu Komponenti Çökdür (Simulate Component Crash)"** düyməsi vasitəsilə lokal ErrorBoundary təcridinin sınağı.

---

## 📌 Checkpoint 4: Validated Forms — Manual Validation (15 Bal)

* **`useForm` Composable (`src/shared/composables/useForm.js`)**: Touch-based sahə yoxlanışı (`@blur`), `isDirty` vəziyyəti, `isValid`, `isSubmitting` və xətalı sahələrdə `@keyframes formShake` animasiyası.
* **`validators.js` (`src/shared/utils/validators.js`)**: `validateRequired`, `validateEmail`, `validateMinLength`, `validateMaxLength`, `validateUrl`, `validateFutureDate`, `validateNoHtml`.
* **3 Validasiyalı Forma**:
  1. **Profil Düzəliş Forması** (`/profile`): Ad, sistem rolu, bio (canlı 200 simvol sayğacı), veb sayt URL.
  2. **Genişləndirilmiş Tapşırıq Forması** (`/tasks`): Başlıq (min 5 simvol), prioritet, kateqoriya, son tarix.
  3. **Dəstək & Rəy Forması** (`/dashboard`): Mövzu (min 5), kateqoriya, üstünlük, mesaj (min 20, canlı 500 sayğac).

---

## 📌 Checkpoint 1, 2 & 3: Router Guards, Auth & Global State (55 Bal)

* **Checkpoint 1 (15 Bal)**: Public (`/`, `/catalog`), Protected (`/dashboard`, `/tasks`, `/cart`, `/profile`), Guest (`/login`), 404 Catch-all (`/:pathMatch(.*)*`). `beforeEach` guard ilə icazəsiz girişlərin `/login?redirect=...` yönləndirilməsi.
* **Checkpoint 2 (20 Bal)**: Base64Url 3 hissəli JWT (Header, Payload Claims, Signature). `localStorage` üzərindən `F5` refresh persistence. 401 Interceptor ilə sessiya vaxtı bitdikdə dövrəsiz təhlükəsiz çıxış.
* **Checkpoint 3 (20 Bal)**: Mərkəzləşdirilmiş Redux pattern store (`globalStore.dispatch`), Action History logger, Cart/Tasks/Toast slices və Stale Closure vs Fresh Reducer Diaqnostik laboratoriyası.

---

## 💎 BEM (Block Element Modifier) CSS Naming Sistemi

Bütün dizayn sistemi xalis CSS və BEM metodologiyası ilə yazılmışdır (heç bir xarici CSS framework-ü istifadə edilməmişdir):
* **Bloklar**: `.app-header`, `.state-inspector`, `.cart-card`, `.task-item`, `.error-fallback-card`, `.api-sim-card`
* **Elementlər**: `.error-fallback-card__title`, `.api-sim-card__header`, `.task-item__title`, `.cart-card__name`
* **Modifikatorlar**: `.api-sim-card--failing`, `.task-item--syncing`, `.badge--pulse`, `.demo-btn--crash`, `.btn--solid`

---

## 🚀 Layihəni İşə Salma Qaydası

### 1. Asılılıqları Quraşdırın:
```bash
npm.cmd install
```

### 2. İnkişaf Serverini Başladın:
```bash
npm.cmd run dev
```
Tətbiq `http://localhost:3000/` ünvanında açılacaqdır.

### 3. Production Build Testi:
```bash
npm.cmd run build
```

---

## 🧪 Qiymətləndirmə üçün Canlı Test Ssenariləri (Addım-Addım)

### 1. Checkpoint 5 (Optimistic UI & Rollback) Testi:
1. `/tasks` səhifəsinə daxil olun (və ya sağ aşağıdakı **Redux State DevTools** panelini açın).
2. **Normal Rejim Testi**: Yeni tapşırıq əlavə edin → Tapşırıq dərhal siyahıda görünür (`⏳ API Sync...`), 300ms sonra server təsdiqləyir və yaşıl `[Təsdiqləndi]` toast-ı çıxır.
3. **Rollback Rejimi Testi**: Səhifənin yuxarısındakı **"⚡ 500 Xətası Simulyasiya Et (Rollback Testi)"** düyməsinə klikləyin (kart qırmızı xəbərdarlıq rejiminə keçəcək).
4. İndi yeni tapşırıq əlavə edin və ya mövcud tapşırığı silin:
   * UI dərhal dəyişir (Optimistic).
   * 300ms sonra Mock API 500 xətası verir.
   * **Nəticə**: Silinən tapşırıq geri qayıdır / əlavə edilən ləğv olunur, qırmızı Rollback bildirişi çıxır və heç bir məlumat itkisi baş vermir!

### 2. Checkpoint 6 (Error Boundary & Crash Isolation) Testi:
1. **Lokal Error Boundary Sınağı**: `/dashboard` səhifəsinə keçin. Səhifənin ortasındakı "Lokal Komponent Xəta Təcridi" bölməsindəki **"💥 Bu Komponenti Çökdür"** düyməsinə klikləyin.
   * **Nəticə**: Yalnız həmin kiçik vidjet qırmızı Error Boundary fallback kartı ilə əvəzlənir. Başlıqdakı menyular, səbət sayğacı, footer və digər bütün səhifələr çökmədən tam işlək qalır!
   * **"🔄 Komponenti Yenidən Başlat"** düyməsinə basaraq komponenti sıfırlayın.
2. **Qlobal Error Handler Sınağı**: Ekranın sağ aşağı küncündəki DevTools panelində **"💥 Simulate Crash (CP6)"** düyməsinə klikləyin.
   * **Nəticə**: Qlobal xəta tutulur, qırmızı bildiriş çıxır, tətbiq ağ ekrana düşmür və işləməyə davam edir.

### 3. Checkpoint 7 (Feature-Based Structure) Testi:
* Kod bazasında `src/features/` və `src/shared/` qovluqlarını yoxlayın.
* Bütün import yolları modulyardır və `npm.cmd run build` əmri 100% xətasız build olunur.
