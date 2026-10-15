(function (window, document) {
    var header = document.getElementById('header');
    var menuButton = document.getElementById('menuBtn');
    var nav = document.getElementById('site-nav');
    var data = window.IEKArticleData;

    if (!header || !menuButton || !nav || !data) {
        return;
    }

    var mobileQuery = window.matchMedia('(max-width: 900px)');

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function articleLink(article) {
        return '<div class="list"><a href="./article.html">'
            + escapeHtml(article.title) + '</a></div>';
    }

    function submenu(section) {
        var content = '';

        if (section.categories) {
            section.categories.forEach(function (category) {
                content += '<div class="menuCategory">'
                    + '<div class="menuCategoryTitle">'
                    + escapeHtml(category.title) + '</div>'
                    + category.articles.map(articleLink).join('')
                    + '</div>';
            });
        } else {
            content = section.articles.map(articleLink).join('');
        }

        return '<div class="subMenu" role="menu" aria-label="'
            + escapeHtml(section.label) + '文章列表">' + content + '</div>';
    }

    function sectionItem(section, index) {
        var title = '<span class="chapter">' + escapeHtml(section.label) + '</span>';

        if (section.subtitle) {
            title += '<span class="text">' + escapeHtml(section.subtitle) + '</span>';
        }

        return '<li class="navSection navSection--' + escapeHtml(section.id)
            + '" style="--section-color:' + escapeHtml(section.color) + '">'
            + '<div class="navGroup" tabindex="0" role="button" aria-expanded="false"'
            + ' aria-controls="submenu-' + escapeHtml(section.id) + '">'
            + '<span class="navTitle">' + title + '</span>'
            + submenu(section).replace('class="subMenu"', 'class="subMenu" id="submenu-'
                + escapeHtml(section.id) + '"')
            + '</div></li>';
    }

    function renderNavigation() {
        var menu = document.getElementById('main-menu');
        var legacy = document.getElementById('legacy-site-nav');

        if (!menu) {
            return;
        }

        menu.innerHTML = '<li class="navHome"><a class="mainTitle" href="./index.html">'
            + '<span class="title">首頁</span></a></li>'
            + data.sections.map(sectionItem).join('')
            + '<li class="navHistory"><a class="mainTitle" href="https://ieknet.iek.org.tw/IEKTopics/history/IEKTopics.aspx" target="_blank" rel="noopener">'
            + '<span class="title">歷年專刊</span></a></li>';

        if (legacy) {
            legacy.remove();
        }
    }

    function syncHeaderHeight() {
        var height = Math.ceil(header.getBoundingClientRect().height);

        document.documentElement.style.setProperty('--nav-height', height + 'px');
    }

    renderNavigation();
    syncHeaderHeight();

    if (window.ResizeObserver) {
        new window.ResizeObserver(syncHeaderHeight).observe(header);
    } else {
        window.addEventListener('resize', syncHeaderHeight);
    }

    var groups = Array.prototype.slice.call(nav.querySelectorAll('.navGroup'));

    function setGroupExpanded(group, expanded) {
        group.classList.toggle('is-open', expanded);
        group.setAttribute('aria-expanded', String(expanded));
    }

    function closeGroups(except) {
        groups.forEach(function (group) {
            if (group !== except) {
                setGroupExpanded(group, false);
            }
        });
    }

    function closeMenu() {
        nav.classList.remove('is-open');
        menuButton.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.setAttribute('aria-label', '開啟選單');
        document.body.classList.remove('active');
        closeGroups();
    }

    function openMenu() {
        nav.classList.add('is-open');
        menuButton.classList.add('active');
        menuButton.setAttribute('aria-expanded', 'true');
        menuButton.setAttribute('aria-label', '關閉選單');
        document.body.classList.add('active');
    }

    groups.forEach(function (group) {
        group.addEventListener('mouseenter', function () {
            if (!mobileQuery.matches) {
                closeGroups(group);
                setGroupExpanded(group, true);
            }
        });

        group.addEventListener('mouseleave', function () {
            if (!mobileQuery.matches && !group.contains(document.activeElement)) {
                setGroupExpanded(group, false);
            }
        });

        group.addEventListener('focusin', function () {
            if (!mobileQuery.matches) {
                closeGroups(group);
                setGroupExpanded(group, true);
            }
        });

        group.addEventListener('focusout', function () {
            window.setTimeout(function () {
                if (!mobileQuery.matches && !group.contains(document.activeElement)
                    && !group.matches(':hover')) {
                    setGroupExpanded(group, false);
                }
            }, 0);
        });

        group.addEventListener('keydown', function (event) {
            if ((event.key === 'Enter' || event.key === ' ') && mobileQuery.matches) {
                event.preventDefault();
                var open = !group.classList.contains('is-open');
                closeGroups(group);
                setGroupExpanded(group, open);
            }
        });
    });

    nav.addEventListener('click', function (event) {
        var group = event.target.closest('.navGroup');

        if (!group || !mobileQuery.matches) {
            return;
        }

        if (event.target.closest('.subMenu a')) {
            closeMenu();
            event.stopImmediatePropagation();
            return;
        }

        event.preventDefault();
        event.stopImmediatePropagation();
        var open = !group.classList.contains('is-open');
        closeGroups(group);
        setGroupExpanded(group, open);
    }, true);

    menuButton.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (nav.classList.contains('is-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }, true);

    document.addEventListener('click', function (event) {
        if (mobileQuery.matches && nav.classList.contains('is-open') && !header.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
            closeMenu();

            if (mobileQuery.matches) {
                menuButton.focus();
            } else {
                var logoLink = header.querySelector('.logo a');
                if (logoLink) {
                    logoLink.focus();
                }
            }
        }
    });

    function handleViewportChange() {
        closeMenu();
    }

    if (mobileQuery.addEventListener) {
        mobileQuery.addEventListener('change', handleViewportChange);
    } else {
        mobileQuery.addListener(handleViewportChange);
    }
}(window, document));
