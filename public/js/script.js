const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const sidebar = $('#appSidebar');
const overlay = $('#sidebarOverlay');
const openButton = $('.sidebar-open');
const closeButton = $('.sidebar-close');
const collapseButton = $('.sidebar-collapse');
const sidebarStorageKey = 'mash-sidebar-collapsed';

const lerStorage = (key) => {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
};
const gravarStorage = (key, value) => {
    try {
        localStorage.setItem(key, value);
    } catch {
        /* sem storage */
    }
};

function setDesktopSidebarState(collapsed, persist = true) {
    if (!sidebar || !collapseButton) return;

    sidebar.dataset.sidebarState = collapsed ? 'collapsed' : 'expanded';
    if (persist) gravarStorage(sidebarStorageKey, String(collapsed));
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    collapseButton.setAttribute('aria-expanded', String(!collapsed));
    collapseButton.setAttribute('aria-label', collapsed ? 'Expandir menu' : 'Recolher menu');

    const icon = collapseButton.querySelector('i');
    icon?.classList.remove('ph-caret-double-left', 'ph-caret-double-right');
    icon?.classList.add(collapsed ? 'ph-caret-double-right' : 'ph-caret-double-left');
}

if (sidebar && collapseButton) {
    const savedState = lerStorage(sidebarStorageKey);
    if (savedState === 'true' || savedState === 'false')
        setDesktopSidebarState(savedState === 'true', false);
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

// Item ativo: a seção do link (data-secao) é prefixo do caminho atual; o ícone fica preenchido
$$('.menu-link[data-secao]').forEach((link) => {
    const ativo = link.dataset.secao
        .split(' ')
        .some((secao) => window.location.pathname.startsWith(secao));
    if (!ativo) return;
    link.classList.add('menu-link-active');
    link.setAttribute('aria-current', 'page');
    const icon = link.querySelector('i');
    icon?.classList.replace('ph', 'ph-fill');
});

// Mostrar/ocultar senha: botão com data-toggle-senha="<id do input>"
$$('[data-toggle-senha]').forEach((botao) => {
    const campo = document.getElementById(botao.dataset.toggleSenha);
    if (!campo) return;
    botao.addEventListener('click', () => {
        const visivel = campo.type === 'text';
        campo.type = visivel ? 'password' : 'text';
        botao.setAttribute('aria-label', visivel ? 'Mostrar senha' : 'Ocultar senha');
        botao
            .querySelector('i')
            ?.classList.replace(
                visivel ? 'ph-eye-slash' : 'ph-eye',
                visivel ? 'ph-eye' : 'ph-eye-slash'
            );
    });
});

const inputFoto = $('#inputFoto');
inputFoto?.addEventListener('change', () => {
    const file = inputFoto.files?.[0];
    const preview = $('#previewFoto');
    if (!file || !preview) return;
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
        preview.src = event.target.result;
    });
    reader.readAsDataURL(file);
});

function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('overflow-hidden');
    modal.querySelector('input, select, button:not([data-modal-close])')?.focus();
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
    if (![...$$('.js-modal')].some((item) => !item.classList.contains('hidden')))
        document.body.classList.remove('overflow-hidden');
}

$$('[data-modal-open]').forEach((button) =>
    button.addEventListener('click', () => openModal($('#' + button.dataset.modalOpen)))
);
$$('[data-modal-close]').forEach((button) =>
    button.addEventListener('click', () => closeModal(button.closest('.js-modal')))
);
$$('.js-modal').forEach((modal) =>
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal(modal);
    })
);
