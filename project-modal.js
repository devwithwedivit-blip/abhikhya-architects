// Interactive Project Modal & Details System for Design Vatika Architects, Pilibhit
(function () {
  'use strict';

  let projectsData = [];
  let currentProjectIndex = 0;

  // Self-contained CSS styles to guarantee flawless rendering independent of Tailwind purging
  const STYLES = `
    #abhikhya-project-modal {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    }
    #abhikhya-project-modal.is-open {
      display: flex !important;
      animation: vatikaFadeIn 0.25s ease-out forwards;
    }
    #project-modal-backdrop {
      position: absolute;
      inset: 0;
      cursor: pointer;
    }
    #project-modal-card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 1080px;
      max-height: 90vh;
      background: #FFFFFF;
      color: #1A1A1A;
      border-radius: 16px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4);
      border: 1px solid #E5E5E5;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      animation: vatikaScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes vatikaFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes vatikaScaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-header-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 24px;
      background: #FFFFFF;
      border-bottom: 1px solid #EAEAEA;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .modal-body-scroll {
      overflow-y: auto;
      padding: 24px 28px;
      flex: 1;
      -webkit-overflow-scrolling: touch;
    }
    .modal-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      align-items: start;
    }
    @media (min-width: 900px) {
      .modal-grid {
        grid-template-columns: 5fr 7fr;
      }
    }
    .modal-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .modal-spec-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #F0F0F0;
      font-size: 13px;
    }
    .modal-spec-label {
      color: #6B7280;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.04em;
    }
    .modal-spec-val {
      color: #111827;
      font-weight: 600;
    }
    .modal-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s;
    }
    .modal-btn-primary {
      background: #000000;
      color: #FFFFFF;
    }
    .modal-btn-primary:hover {
      background: #262626;
      color: #FFFFFF;
    }
    .modal-btn-secondary {
      background: #EFEFEF;
      color: #1A1A1A;
    }
    .modal-btn-secondary:hover {
      background: #DFDFDF;
    }
    .modal-nav-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F0F0F0;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      color: #333333;
      transition: background 0.15s;
    }
    .modal-nav-icon-btn:hover {
      background: #D8D8D8;
    }
    .modal-close-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #F0F0F0;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      color: #1A1A1A;
      margin-left: 6px;
      transition: all 0.15s;
    }
    .modal-close-icon-btn:hover {
      background: #000000;
      color: #FFFFFF;
    }
  `;

  function injectStyles() {
    if (document.getElementById('abhikhya-modal-styles')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'abhikhya-modal-styles';
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
  }

  function createModalDOM() {
    if (document.getElementById('abhikhya-project-modal')) return;

    injectStyles();

    const modalHTML = `
      <div id="abhikhya-project-modal" role="dialog" aria-modal="true">
        <div id="project-modal-backdrop"></div>

        <div id="project-modal-card">
          <!-- Top Bar -->
          <div class="modal-header-bar">
            <div style="display:flex;align-items:center;gap:10px;">
              <span id="modal-typology-badge" class="modal-badge" style="background:#F0F0F0;color:#333;border:1px solid #D5D5D5;">
                Typology
              </span>
              <span id="modal-year-badge" class="modal-badge" style="background:#000;color:#FFF;">
                2023 - 2024
              </span>
            </div>

            <div style="display:flex;align-items:center;">
              <button id="modal-prev-btn" class="modal-nav-icon-btn" aria-label="Previous Project">←</button>
              <button id="modal-next-btn" class="modal-nav-icon-btn" style="margin-left:6px;" aria-label="Next Project">→</button>
              <button id="modal-close-btn" class="modal-close-icon-btn" aria-label="Close Project Modal">✕</button>
            </div>
          </div>

          <!-- Body Content -->
          <div class="modal-body-scroll">
            <div class="modal-grid">
              
              <!-- Left Visual & Specs -->
              <div>
                <div style="position:relative;width:100%;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#E5E7EB;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
                  <img id="modal-project-img" src="" alt="Project Image" style="width:100%;height:100%;object-fit:cover;display:block;" />
                  <div style="position:absolute;bottom:10px;left:10px;right:10px;background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);border-radius:8px;padding:8px 12px;color:#FFF;font-size:11px;text-transform:uppercase;letter-spacing:0.04em;">
                    📍 <span id="modal-location-val">Location</span>
                  </div>
                </div>

                <!-- Specifications Box -->
                <div style="background:#FBFBFB;border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin-top:16px;">
                  <div class="modal-spec-row">
                    <span class="modal-spec-label">When Developed:</span>
                    <span id="modal-spec-when" class="modal-spec-val">2023 - 2024</span>
                  </div>
                  <div class="modal-spec-row">
                    <span class="modal-spec-label">Where Developed:</span>
                    <span id="modal-spec-where" class="modal-spec-val">Greater Noida, India</span>
                  </div>
                  <div class="modal-spec-row">
                    <span class="modal-spec-label">Typology:</span>
                    <span id="modal-spec-type" class="modal-spec-val">Celebrity Residence</span>
                  </div>
                  <div class="modal-spec-row">
                    <span class="modal-spec-label">Floor Area:</span>
                    <span id="modal-spec-area" class="modal-spec-val">4,200 sq.ft.</span>
                  </div>
                  <div class="modal-spec-row" style="border-bottom:none;">
                    <span class="modal-spec-label">Client / Scope:</span>
                    <span id="modal-spec-client" class="modal-spec-val">Mr. Harsh Gujral / Turnkey</span>
                  </div>
                </div>
              </div>

              <!-- Right Narrative & Highlights -->
              <div>
                <h2 id="modal-project-title" style="font-size:28px;font-weight:400;color:#111;margin:0 0 6px 0;line-height:1.2;">
                  Project Title
                </h2>
                <p id="modal-project-tagline" style="font-size:14px;color:#666;font-weight:300;margin:0 0 18px 0;line-height:1.5;">
                  Project Tagline
                </p>

                <!-- Scope Tag -->
                <div style="background:#F0F0F0;border-left:4px solid #000;border-radius:6px;padding:10px 14px;margin-bottom:20px;font-size:12px;color:#333;">
                  <strong>SCOPE:</strong> <span id="modal-project-scope">Architecture, 3D Modeling & Turnkey Execution</span>
                </div>

                <!-- Narrative -->
                <div style="margin-bottom:24px;">
                  <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:700;margin:0 0 10px 0;">
                    Design Story & Architectural Concept
                  </h3>
                  <div id="modal-narrative-container" style="font-size:14px;line-height:1.7;color:#374151;font-weight:300;">
                  </div>
                </div>

                <!-- Highlights List -->
                <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:16px;margin-bottom:24px;">
                  <h3 style="font-size:11px;text-transform:uppercase;letter-spacing:0.06em;color:#888;font-weight:700;margin:0 0 10px 0;">
                    Key Architectural Highlights
                  </h3>
                  <ul id="modal-highlights-list" style="margin:0;padding:0;list-style:none;">
                  </ul>
                </div>

                <!-- Action Buttons -->
                <div style="display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
                  <a id="modal-contact-cta" href="/contact" class="modal-btn modal-btn-primary">
                    <span>Inquire About Similar Project</span>
                    <span>→</span>
                  </a>
                  <a id="modal-direct-link" href="#" class="modal-btn modal-btn-secondary">
                    View Standalone Page
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupModalEvents();
  }

  function openProjectModal(slug) {
    if (!projectsData || projectsData.length === 0) return;

    let index = projectsData.findIndex(p => p.slug === slug);
    if (index === -1) index = 0;
    currentProjectIndex = index;
    renderProjectData(projectsData[index]);

    const modal = document.getElementById('abhikhya-project-modal');
    if (!modal) return;

    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    try {
      history.pushState({ projectModal: slug }, '', '/projects/' + slug);
    } catch (e) {}
  }

  function closeProjectModal() {
    const modal = document.getElementById('abhikhya-project-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    try {
      if (window.location.pathname.startsWith('/projects/')) {
        history.pushState(null, '', '/');
      }
    } catch (e) {}
  }

  function renderProjectData(p) {
    if (!p) return;

    document.getElementById('modal-typology-badge').textContent = p.typology || 'Architecture';
    document.getElementById('modal-year-badge').textContent = p.when || '2023 - 2024';
    document.getElementById('modal-project-img').src = p.image || '';
    document.getElementById('modal-project-img').alt = p.title || 'Project Image';
    document.getElementById('modal-location-val').textContent = p.where || 'India';

    document.getElementById('modal-spec-when').textContent = p.when || '';
    document.getElementById('modal-spec-where').textContent = p.where || '';
    document.getElementById('modal-spec-type').textContent = p.typology || '';
    document.getElementById('modal-spec-area').textContent = p.area || 'Custom Residence';
    document.getElementById('modal-spec-client').textContent = p.client || 'Private Client';

    document.getElementById('modal-project-title').textContent = p.title || '';
    document.getElementById('modal-project-tagline').textContent = p.tagline || '';
    document.getElementById('modal-project-scope').textContent = p.scope || '';

    const narrativeContainer = document.getElementById('modal-narrative-container');
    narrativeContainer.innerHTML = '';
    const narrativeList = Array.isArray(p.narrative) ? p.narrative : [p.summary || ''];
    narrativeList.forEach(para => {
      const pEl = document.createElement('p');
      pEl.style.margin = '0 0 10px 0';
      pEl.textContent = para;
      narrativeContainer.appendChild(pEl);
    });

    const hlList = document.getElementById('modal-highlights-list');
    hlList.innerHTML = '';
    const highlights = p.highlights || [];
    highlights.forEach(hl => {
      const li = document.createElement('li');
      li.style.cssText = 'display:flex;align-items:start;gap:8px;font-size:13px;color:#374151;margin-bottom:6px;';
      li.innerHTML = '<span style="color:#000;font-weight:bold;">✓</span><span>' + hl + '</span>';
      hlList.appendChild(li);
    });

    document.getElementById('modal-contact-cta').href = '/contact?project=' + encodeURIComponent(p.slug);
    document.getElementById('modal-direct-link').href = '/projects/' + p.slug;
  }

  function setupModalEvents() {
    const modal = document.getElementById('abhikhya-project-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const backdrop = document.getElementById('project-modal-backdrop');
    const prevBtn = document.getElementById('modal-prev-btn');
    const nextBtn = document.getElementById('modal-next-btn');

    if (closeBtn) closeBtn.onclick = closeProjectModal;
    if (backdrop) backdrop.onclick = closeProjectModal;

    if (prevBtn) {
      prevBtn.onclick = () => {
        currentProjectIndex = (currentProjectIndex - 1 + projectsData.length) % projectsData.length;
        renderProjectData(projectsData[currentProjectIndex]);
        try {
          history.replaceState({ projectModal: projectsData[currentProjectIndex].slug }, '', '/projects/' + projectsData[currentProjectIndex].slug);
        } catch (e) {}
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        currentProjectIndex = (currentProjectIndex + 1) % projectsData.length;
        renderProjectData(projectsData[currentProjectIndex]);
        try {
          history.replaceState({ projectModal: projectsData[currentProjectIndex].slug }, '', '/projects/' + projectsData[currentProjectIndex].slug);
        } catch (e) {}
      };
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
        closeProjectModal();
      }
      if (modal && modal.classList.contains('is-open')) {
        if (e.key === 'ArrowLeft' && prevBtn) prevBtn.click();
        if (e.key === 'ArrowRight' && nextBtn) nextBtn.click();
      }
    });

    window.addEventListener('popstate', (e) => {
      if (!window.location.pathname.startsWith('/projects/')) {
        closeProjectModal();
      }
    });
  }

  function attachProjectCardClicks() {
    document.addEventListener('click', function (e) {
      const target = e.target.closest('a[href*="/projects/"], a[href*="project="], [data-project-slug], .group.relative');
      if (!target) return;

      let slug = null;

      if (target.dataset && target.dataset.projectSlug) {
        slug = target.dataset.projectSlug;
      } else if (target.getAttribute && target.getAttribute('href')) {
        const href = target.getAttribute('href');
        if (href.includes('/projects/')) {
          slug = href.split('/projects/')[1].split('?')[0].split('#')[0].replace(/\/$/, '');
        } else if (href.includes('project=')) {
          slug = href.split('project=')[1].split('&')[0];
        }
      }

      if (!slug) {
        const img = target.querySelector('img');
        if (img && img.src && img.src.includes('/images/projects/')) {
          const match = img.src.match(/project-\d+-(.+?)\.webp/);
          if (match) slug = match[1];
        }
      }

      if (slug && slug !== 'index') {
        e.preventDefault();
        e.stopPropagation();
        openProjectModal(slug);
      }
    }, true);
  }

  async function init() {
    try {
      const res = await fetch('/projects-data.json');
      if (res.ok) {
        projectsData = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch projects-data.json', e);
    }

    createModalDOM();
    attachProjectCardClicks();

    // Check direct URL on landing
    const path = window.location.pathname;
    if (path.startsWith('/projects/') && path.length > '/projects/'.length) {
      const slug = path.split('/projects/')[1].replace(/\/$/, '').replace('.html', '');
      if (slug && slug !== 'index') {
        setTimeout(() => openProjectModal(slug), 300);
      }
    } else {
      const params = new URLSearchParams(window.location.search);
      const projParam = params.get('project');
      if (projParam) {
        setTimeout(() => openProjectModal(projParam), 300);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.openDesign VatikaProject = openProjectModal;
  window.closeDesign VatikaProject = closeProjectModal;
})();
