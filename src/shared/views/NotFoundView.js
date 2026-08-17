export const NotFoundView = {
  name: 'NotFoundView',
  template: `
    <section class="not-found-view">
      <div class="not-found-card">
        <div class="not-found-card__code">404</div>
        <h1 class="not-found-card__title">Səhifə Tapılmadı</h1>
        <p class="not-found-card__desc">
          Axtardığınız marşrut və ya səhifə mövcud deyil və ya ünvan səhv daxil edilib.
        </p>
        <div class="not-found-card__actions">
          <router-link to="/" class="btn btn--primary btn--lg">
            ← Ana Səhifəyə Qayıt
          </router-link>
          <router-link to="/catalog" class="btn btn--outline btn--lg">
            Kataloqa Keç
          </router-link>
        </div>
      </div>
    </section>
  `
};
