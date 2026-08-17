# DevJoint · Vue 3 Frontend Tətbiqi (Checkpoint 1)

Bu layihə **Vue 3**, **Vue Router 4** və **BEM (Block Element Modifier)** metodologiyası ilə hazırlanmış, müasir və tam frontend yönümlü veb tətbiqidir.

---

## 📌 Checkpoint 1: İcra Olunmuş İşlər və Nəticələr

Bu mərhələdə (`guide.md`, `assestments.md`, `quality__checks.md` sənədlərinə uyğun olaraq) layihənin naviqasiya, qorunan marşrutlar və frontend arxitektura bazası tam qurulmuşdur:

### 1. Marşrutlaşdırma (Routing) və Route Kateqoriyaları
* **İctimai Marşrutlar (Public Routes)**:
  * `/` — Əsas ana səhifə, interaktiv route test konsolu və xüsusiyyətlər bölməsi.
  * `/catalog` — Məhsul və xidmətlər kataloqu (giriş tələb olunmur).
* **Qorunan Marşrutlar (Protected Routes - `meta: { requiresAuth: true }`)**:
  * `/dashboard` — İstifadəçi idarə paneli, profil statistikası və qorunan menyu.
  * `/tasks` — Tapşırıqlar lövhəsi və iş axını.
  * `/cart` — Alış-veriş səbəti və checkout.
  * `/profile` — İstifadəçi hesabı və sessiya məlumatları.
* **Qonaq Marşrutu (Guest Route - `meta: { requiresGuest: true }`)**:
  * `/login` — Giriş portalı. Daxil olmuş istifadəçilər bu səhifəyə daxil olduqda avtomatik olaraq `/dashboard`-a yönləndirilir.
* **404 Xəta Marşrutu (Catch-All)**:
  * `/:pathMatch(.*)*` — Mövcud olmayan və ya səhv yazılan bütün URL-lər xüsusi dizayn edilmiş `/404` (`NotFoundView`) səhifəsinə yönləndirilir.

---

### 2. Vue Router Navigation Guards (`beforeEach`) Mexanizmi
Qorunan səhifələrə icazəsiz girişlərin qarşısını almaq üçün `src/router/index.js` daxilində qlobal `router.beforeEach` quraşdırılmışdır:

1. **Qeydiyyatsız Girişin Əngəllənməsi və Redirect**:
   * İstifadəçi sistemə daxil olmadan `/dashboard`, `/tasks` və ya `/cart` kimi qorunan səhifəyə keçmək istədikdə, keşiş (navigation guard) keçidi dayandırır.
   * `authStore.setNotice()` vasitəsilə istifadəçiyə `"🔒 Giriş Tələb Olunur"` xəbərdarlığı göstərilir.
   * İstifadəçi avtomatik olaraq `/login?redirect=${encodeURIComponent(to.fullPath)}` ünvanına yönləndirilir.
2. **Uğurlu Girişdən Sonra Hədəf Səhifəyə Qayıdış**:
   * İstifadəçi `/login` formasını təsdiqlədikdə, URL-dəki `redirect` parametri yoxlanılır və istifadəçi birbaşa ilk daxil olmaq istədiyi səhifəyə göndərilir.
3. **Daxil Olmuş İstifadəçi Qoruması**:
   * Əgər istifadəçi artıq autentifikasiyadan keçibsə və `/login` səhifəsinə daxil olmağa çalışarsa, dərhal `/dashboard`-a yönləndirilir.
4. **Dinamik Səhifə Başlıqları (SEO & UX)**:
   * Hər route dəyişdikdə brauzerin səhifə başlığı `document.title = ...` dinamik yenilənir.

---

### 3. Reaktiv Auth State İdarəetməsi (`src/state/authStore.js`)
* Vue 3 `reactive` və `computed` xüsusiyyətlərindən istifadə edərək token və istifadəçi məlumatları idarə olunur.
* `localStorage` inteqrasiyası sayəsində səhifə yeniləndikdə (F5 / Refresh) sessiya itmir (`quality__checks.md` tələbi).
* Çıxış (`logout`) zamanı bütün həssas sessiya məlumatları təmizlənir və qorunan səhifələrə giriş dərhal məhdudlaşdırılır.

---

## 💎 BEM (Block Element Modifier) CSS Naming Sistemi

Layihədə bütün vizual elementlər və CSS dərhal oxunaqlı və modulyar olan **BEM** standartı ilə yazılmışdır:

| Tip | Nümunə | Təsviri |
| :--- | :--- | :--- |
| **Bloklar (Block)** | `.app-header`, `.hero`, `.route-card`, `.auth-form`, `.task-card` | Müstəqil funksional komponent vahidləri |
| **Elementlər (Element)** | `.app-header__brand`, `.hero__title`, `.route-card__desc`, `.auth-form__input` | Blokun daxilindəki tərkib hissələri (`__` ilə ayrılır) |
| **Modifikatorlar (Modifier)** | `.btn--primary`, `.btn--outline`, `.badge--protected`, `.nav-list__link--active` | Vəziyyət və ya görünüş dəyişiklikləri (`--` ilə ayrılır) |

---

## 📂 Qovluq və Fayl Strukturu

```text
├── index.html                 # Əsas HTML şablonu (Outfit & JetBrains Mono şriftləri, root mount)
├── package.json               # Vue 3, Vue Router 4 və Vite konfiqurasiyası
├── vite.config.js             # Vite dev server və runtime compiler sazlamaları
├── styles.css                 # BEM metodologiyası ilə yazılmış tam CSS dizayn sistemi
├── script.js                  # Giriş modulu körpüsü
├── src/
│   ├── main.js                # Vue tətbiqinin bootstrap və router quraşdırılması
│   ├── router/
│   │   └── index.js           # Vue Router marşrutları və Navigation Guards (beforeEach)
│   ├── state/
│   │   └── authStore.js       # Reaktiv Mock Auth vəziyyəti, token və bildirişlər
│   ├── components/
│   │   ├── AppHeader.js       # BEM başlıq paneli, naviqasiya və test auth açarı
│   │   ├── RouteBanner.js     # Route keçid və qoruma xəbərdarlıq banneri
│   │   └── AppFooter.js       # BEM footer komponenti
│   └── views/
│       ├── HomeView.js        # İctimai ana səhifə və route guard test konsolu
│       ├── CatalogView.js     # İctimai məhsul kataloqu (/catalog)
│       ├── LoginView.js       # Giriş səhifəsi və redirect parametrləri (/login)
│       ├── DashboardView.js   # Qorunan idarəetmə paneli (/dashboard)
│       ├── TasksView.js       # Qorunan tapşırıqlar bölməsi (/tasks)
│       ├── CartView.js        # Qorunan səbət və sifariş bölməsi (/cart)
│       ├── ProfileView.js     # Qorunan profil və sessiya məlumatları (/profile)
│       └── NotFoundView.js    # 404 Tapılmayan səhifə marşrutu (/404)
├── readme.md                  # Layihə sənədləşməsi və izahı
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

## 🧪 Canlı Test Senarisi (Checkpoint 1 Testləri)

1. **Qorunan Səhifə Testi**: Sistemə daxil olmadan ana səhifədəki **"İdarə Panelinə Keç (Protected)"** düyməsinə klikləyin.
   * *Gözlənilən nəticə*: Keçid bloklanır, `"Giriş Tələb Olunur"` xəbərdarlığı çıxır və URL `/login?redirect=%2Fdashboard` olur.
2. **Giriş və Geri Qayıdış**: Login səhifəsində **"Daxil Ol və Yönləndir →"** düyməsinə klikləyin.
   * *Gözlənilən nəticə*: Mock token yaranır və istifadəçi birbaşa `/dashboard` səhifəsinə yönləndirilir.
3. **Qorunan Bölmələr**: Daxil olduqdan sonra başlıqdakı `/tasks`, `/cart` və `/profile` keçidlərinə klikləyin.
   * *Gözlənilən nəticə*: Bütün qorunan səhifələr maneəsiz açılır.
4. **Çıxış (Logout) Testi**: Başlıqdakı **"Çıxış Et"** düyməsinə klikləyin.
   * *Gözlənilən nəticə*: Token və sessiya təmizlənir, istifadəçi login səhifəsinə qaytarılır.
5. **404 Xəta Testi**: Brauzerdə `http://localhost:3000/sehife-yoxdur` yazın.
   * *Gözlənilən nəticə*: Avtomatik olaraq xüsusi 404 səhifəsi göstərilir.
