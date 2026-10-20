(function (window, document) {
    'use strict';

    var dialog = document.getElementById('articleNotice');
    var closeButton = document.getElementById('closeArticleNotice');
    var confirmButton = document.getElementById('confirmArticleNotice');
    var menuButton = document.getElementById('menuBtn');
    var menu = document.getElementById('main-menu');

    if (!dialog || !closeButton || !confirmButton || !menu) { return; }

    var mobileQuery = window.matchMedia('(max-width: 900px)');
    var trigger = null;
    var backdropPointerDown = false;

    // Navigation is rendered synchronously by header-menu.js before this script.
    // Keep real article destinations out of this page's links, including their context menus.
    Array.prototype.forEach.call(menu.querySelectorAll('.subMenu a'), function (link) {
        link.setAttribute('href', '#articleNotice');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.setAttribute('aria-haspopup', 'dialog');
        link.setAttribute('aria-controls', dialog.id);
        link.setAttribute('data-article-notice', '');
    });

    function articleLink(target) {
        return target instanceof window.Element
            ? target.closest('#main-menu a[data-article-notice]') : null;
    }

    function openNotice(link) {
        if (dialog.open) { return; }
        trigger = link;
        backdropPointerDown = false;
        dialog.showModal();
        dialog.scrollTop = 0;
        document.documentElement.classList.add('article-notice-open');
        confirmButton.focus({ preventScroll: true });
    }

    function closeNotice() {
        if (dialog.open) { dialog.close(); }
    }

    function handleArticleActivation(event) {
        var link = articleLink(event.target);
        if (!link || event.button > 1) { return; }
        event.preventDefault();
        openNotice(link);
        // Let the mobile navigation's capture listener close its menu as usual.
    }

    document.addEventListener('click', handleArticleActivation, true);
    document.addEventListener('auxclick', handleArticleActivation, true);

    // Run before the menu and video handlers so their Escape/Enter shortcuts
    // cannot move focus behind the announcement dialog or swallow article activation.
    window.addEventListener('keydown', function (event) {
        if (dialog.open) {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopImmediatePropagation();
                closeNotice();
            } else if (event.key === 'Tab') {
                if (event.shiftKey && document.activeElement === closeButton) {
                    event.preventDefault();
                    confirmButton.focus();
                } else if (!event.shiftKey && document.activeElement === confirmButton) {
                    event.preventDefault();
                    closeButton.focus();
                }
            }
            return;
        }

        var link = articleLink(event.target);
        if (link && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            event.stopImmediatePropagation();
            link.click();
        }
    }, true);

    closeButton.addEventListener('click', closeNotice);
    confirmButton.addEventListener('click', closeNotice);
    dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeNotice();
    });
    dialog.addEventListener('close', function () {
        if (dialog.open) { return; }
        document.documentElement.classList.remove('article-notice-open');
        backdropPointerDown = false;
        var returnTarget = mobileQuery.matches ? menuButton : trigger;
        trigger = null;
        if (returnTarget && returnTarget.isConnected) {
            // The desktop dropdown may have closed while its links were inert.
            // Reveal the trigger before focusing it so focus does not fall back to body.
            var group = !mobileQuery.matches && returnTarget.closest('.navGroup');
            if (group) {
                group.classList.add('is-open');
                group.setAttribute('aria-expanded', 'true');
            }
            returnTarget.focus({ preventScroll: true });
        }
    });

    function outsideDialog(event) {
        var bounds = dialog.getBoundingClientRect();
        return event.target === dialog && (event.clientX < bounds.left
            || event.clientX > bounds.right || event.clientY < bounds.top
            || event.clientY > bounds.bottom);
    }

    dialog.addEventListener('pointerdown', function (event) {
        backdropPointerDown = outsideDialog(event);
    });
    dialog.addEventListener('pointercancel', function () {
        backdropPointerDown = false;
    });
    dialog.addEventListener('click', function (event) {
        if (backdropPointerDown && outsideDialog(event)) { closeNotice(); }
        backdropPointerDown = false;
    });
}(window, document));
