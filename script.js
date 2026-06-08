const PREVIEW_DELAY_MS = 0;

const getYouTubeVideoId = (url) => {
    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.slice(1).split('/')[0] || null;
        }

        if (parsed.hostname.includes('youtube.com')) {
            if (parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/')[2] || null;
            }

            return parsed.searchParams.get('v');
        }
    } catch {
        return null;
    }

    return null;
};

const buildPreviewSrc = (videoId) => {
    const params = new URLSearchParams({
        autoplay: '1',
        mute: '1',
        controls: '0',
        modestbranding: '1',
        rel: '0',
        playsinline: '1',
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const setupThumbnailPreview = (link, thumbnail, containerClass = 'thumbnail-container') => {
    const videoId = getYouTubeVideoId(link.href);
    if (!videoId) return;

    const container = document.createElement('div');
    container.className = containerClass;
    thumbnail.parentNode.insertBefore(container, thumbnail);
    container.appendChild(thumbnail);

    const iframe = document.createElement('iframe');
    iframe.className = 'video-preview';
    iframe.setAttribute('title', 'Video preview');
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    container.appendChild(iframe);

    let hoverTimer = null;

    const startPreview = () => {
        iframe.src = buildPreviewSrc(videoId);
        container.classList.add('is-previewing');
    };

    const stopPreview = () => {
        container.classList.remove('is-previewing');
        iframe.src = '';
    };

    container.addEventListener('mouseenter', () => {
        hoverTimer = window.setTimeout(startPreview, PREVIEW_DELAY_MS);
    });

    container.addEventListener('mouseleave', () => {
        if (hoverTimer) {
            clearTimeout(hoverTimer);
            hoverTimer = null;
        }
        stopPreview();
    });
};

const initThumbnailPreviews = (rootSelector, thumbnailSelector, containerClass) => {
    document.querySelectorAll(`${rootSelector} a`).forEach((link) => {
        const thumbnail = link.querySelector(thumbnailSelector);
        if (!thumbnail) return;

        setupThumbnailPreview(link, thumbnail, containerClass);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initThumbnailPreviews('.video-grid', '.video-thumbnail', 'thumbnail-container');
    initThumbnailPreviews('#shorts-section', '.shorts-thumbnail', 'thumbnail-container thumbnail-container--shorts');

    const menuContainers = document.querySelectorAll('.user-menu-container');

    const closeAllMenus = () => {
        menuContainers.forEach((container) => {
            const trigger = container.querySelector('.user-menu-trigger');
            const popover = container.querySelector('.user-popover-menu');

            popover.classList.remove('active');
            trigger.classList.remove('active');
            trigger.setAttribute('aria-expanded', 'false');
        });
    };

    menuContainers.forEach((container) => {
        const menuTrigger = container.querySelector('.user-menu-trigger');
        const popoverMenu = container.querySelector('.user-popover-menu');

        if (!menuTrigger || !popoverMenu) return;

        const closeMenu = () => {
            popoverMenu.classList.remove('active');
            menuTrigger.classList.remove('active');
            menuTrigger.setAttribute('aria-expanded', 'false');
        };

        const openMenu = () => {
            closeAllMenus();
            popoverMenu.classList.add('active');
            menuTrigger.classList.add('active');
            menuTrigger.setAttribute('aria-expanded', 'true');
        };

        const toggleMenu = () => {
            const isOpen = popoverMenu.classList.contains('active');
            if (isOpen) {
                closeMenu();
            } else {
                openMenu();
            }
        };

        menuTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    });

    document.addEventListener('click', (e) => {
        const clickedInsideMenu = [...menuContainers].some((container) =>
            container.contains(e.target)
        );

        if (!clickedInsideMenu) {
            closeAllMenus();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllMenus();
        }
    });
});
