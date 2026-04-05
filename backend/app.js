// =====================================================
//  BACKEND — App Entry Point
//  Handles navigation and bootstraps all page modules
// =====================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initExpensePage();
  initUpcomingPage();
  initBioPage();
});

// =====================================================
//  NAVIGATION
// =====================================================
function initNavigation() {
  const tabBtns = document.querySelectorAll('.nav-tab-btn');
  const pages   = document.querySelectorAll('.page');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.page;
      tabBtns.forEach(b => b.classList.remove('active'));
      pages.forEach(p  => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target).classList.add('active');
    });
  });
}
