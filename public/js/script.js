const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const sidebar = $('#appSidebar');
const overlay = $('#sidebarOverlay');
const openButton = $('.sidebar-open');
const closeButton = $('.sidebar-close');
const collapseButton = $('.sidebar-collapse');
const sidebarStorageKey = 'mash-sidebar-collapsed';

function setDesktopSidebarState(collapsed, persist = true) {
    if (!sidebar || !collapseButton) return;

    const width = collapsed ? '5rem' : '18rem';
    sidebar.dataset.sidebarState = collapsed ? 'collapsed' : 'expanded';
    if (persist) localStorage.setItem(sidebarStorageKey, String(collapsed));
    sidebar.classList.toggle('is-collapsed', collapsed);
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    sidebar.style.width = width;
    sidebar.style.minWidth = width;
    collapseButton.setAttribute('aria-expanded', String(!collapsed));
    collapseButton.setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Recolher menu');

    const icon = collapseButton.querySelector('i');
    icon?.classList.remove('ph-caret-left', 'ph-caret-right');
    icon?.classList.add(collapsed ? 'ph-caret-right' : 'ph-caret-left');
}

if (sidebar && collapseButton) {
    const savedState = localStorage.getItem(sidebarStorageKey);
    if (savedState === 'true' || savedState === 'false') setDesktopSidebarState(savedState === 'true', false);
}

collapseButton?.addEventListener('click', (event) => {
    event.preventDefault();
    setDesktopSidebarState(sidebar.dataset.sidebarState !== 'collapsed');
});

function setSidebar(open) {
    if (!sidebar) return;
    sidebar.classList.toggle('-translate-x-full', !open);
    overlay?.classList.toggle('hidden', !open);
    openButton?.setAttribute('aria-expanded', String(open));
}

openButton?.addEventListener('click', () => setSidebar(true));
closeButton?.addEventListener('click', () => setSidebar(false));
overlay?.addEventListener('click', () => setSidebar(false));

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setSidebar(false);
        $$('.js-modal').forEach((modal) => {
            if (!modal.classList.contains('hidden')) closeModal(modal);
        });
    }
});

$$('.menu-link').forEach((link) => {
    if (link.getAttribute('href') === window.location.pathname) {
        link.classList.add('menu-link-active', 'bg-orange-50', 'text-mash-orange', 'font-semibold');
    }
});

const senha = $('#senha');
const toggleSenha = senha?.parentElement.querySelector('button[type="button"]');
toggleSenha?.addEventListener('click', () => {
    const visible = senha.type === 'text';
    senha.type = visible ? 'password' : 'text';
    toggleSenha.setAttribute('aria-label', visible ? 'Mostrar senha' : 'Ocultar senha');
});

const btnAlterar = $('#btnAlterar');
const btnSalvar = $('#btnSalvar');
btnAlterar?.addEventListener('click', () => {
    $$('#formPerfil input').forEach((input) => { input.disabled = false; });
    btnAlterar.disabled = true;
    btnSalvar.disabled = false;
});

const inputFoto = $('#inputFoto');
inputFoto?.addEventListener('change', () => {
    const file = inputFoto.files?.[0];
    const preview = $('#previewFoto');
    if (!file || !preview) return;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => { preview.src = event.target.result; });
    reader.readAsDataURL(file);
});

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    modal.querySelector('input, button, [data-modal-close]')?.focus();
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (![...$$('.js-modal')].some((item) => !item.classList.contains('hidden'))) document.body.classList.remove('overflow-hidden');
}

$$('[data-modal-open]').forEach((button) => button.addEventListener('click', () => openModal($('#' + button.dataset.modalOpen))));
$$('[data-modal-close]').forEach((button) => button.addEventListener('click', () => closeModal(button.closest('.js-modal'))));
$$('.js-modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModal(modal); }));
