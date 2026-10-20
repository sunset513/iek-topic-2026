(function (window, document) {
    'use strict';

    // Add videos here in their display order. start is measured in seconds.
    var videos = [
        {
            id: 'BwfFtaZyA9g',
            cardTitle: '無人自主產業新布局！',
            title: '跟著 AI 主播 iKi，掌握下一個十年的無人自主產業布局！',
            start: 1
        },
        {
            id: 'BwfFtaZyA9g',
            cardTitle: '無人自主產業新布局！',
            title: '跟著 AI 主播 iKi，掌握下一個十年的無人自主產業布局！',
            start: 1
        },
        {
            id: 'BwfFtaZyA9g',
            cardTitle: '無人自主產業新布局！',
            title: '跟著 AI 主播 iKi，掌握下一個十年的無人自主產業布局！',
            start: 1
        }
    ];
    var widget = document.getElementById('homeVideos');
    var launcher = document.getElementById('toggleVideoList');
    var panel = document.getElementById('homeVideoPanel');
    var panelCloseButton = document.getElementById('closeVideoList');
    var list = document.getElementById('homeVideoList');
    var dialog = document.getElementById('videoLightbox');
    var player = document.getElementById('videoLightboxPlayer');
    var closeButton = document.getElementById('closeVideoLightbox');
    var dismissCheckbox = document.getElementById('dismissVideoLightbox');

    if (!widget || !launcher || !panel || !panelCloseButton || !list
        || !dialog || !player || !closeButton || !dismissCheckbox) { return; }

    var preferenceKey = 'iek-topic-2026:video-lightbox:dismissed';
    var dismissed = false;
    var storageAvailable = true;
    var trigger = null;
    var activeVideo = null;
    var automaticOpen = false;
    var scrollStyles = null;
    var backdropPointerDown = false;
    var state = 'closed';
    var motion = null;
    var backdropMotion = null;
    var motionTimer = null;
    var motionVersion = 0;
    var listState = 'closed';
    var listMotion = null;
    var listMotionTimer = null;
    var listMotionVersion = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function readDismissed() {
        if (storageAvailable) {
            try {
                dismissed = window.localStorage.getItem(preferenceKey) === '1';
            } catch (error) {
                storageAvailable = false;
            }
        }
        return dismissed;
    }

    function saveDismissed() {
        dismissed = dismissCheckbox.checked;
        if (!storageAvailable) { return; }
        try {
            if (dismissed) {
                window.localStorage.setItem(preferenceKey, '1');
            } else {
                window.localStorage.removeItem(preferenceKey);
            }
        } catch (error) {
            // Keep the choice for this page even when browser storage is unavailable.
            storageAvailable = false;
        }
    }

    function cancelListMotion() {
        listMotionVersion += 1;
        window.clearTimeout(listMotionTimer);
        listMotionTimer = null;
        if (listMotion) {
            var previous = listMotion;
            listMotion = null;
            previous.cancel();
        }
    }

    function finishVideoList(open) {
        cancelListMotion();
        listState = open ? 'open' : 'closed';
        panel.dataset.state = listState;
        panel.hidden = !open;
        panel.inert = false;
    }

    function collapsedVideoListFrame() {
        return {
            transform: 'translateY(' + (launcher.offsetHeight + 12) + 'px) scale('
                + launcher.offsetWidth / panel.offsetWidth + ', '
                + launcher.offsetHeight / panel.offsetHeight + ')',
            opacity: 0
        };
    }

    function animateVideoList(from, to, opening) {
        cancelListMotion();
        var version = listMotionVersion;
        function settle() {
            if (version === listMotionVersion) { finishVideoList(opening); }
        }
        if (reducedMotion.matches || typeof panel.animate !== 'function') {
            settle();
            return;
        }
        var duration = opening ? 320 : 260;
        try {
            listMotion = panel.animate([from, to], {
                duration: duration,
                easing: opening ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'cubic-bezier(0.4, 0, 1, 1)',
                fill: 'both'
            });
            listMotion.finished.then(settle, settle);
            listMotionTimer = window.setTimeout(settle, duration + 150);
        } catch (error) {
            settle();
        }
    }

    function closeVideoList(returnFocus, immediate) {
        launcher.setAttribute('aria-expanded', 'false');
        launcher.setAttribute('aria-label', '開啟影片清單');
        if (returnFocus || panel.contains(document.activeElement)) {
            launcher.focus({ preventScroll: true });
        }
        if (immediate || listState === 'closed') {
            finishVideoList(false);
            return;
        }
        if (listState === 'closing') { return; }
        var current = window.getComputedStyle(panel);
        var from = { transform: current.transform, opacity: current.opacity };
        listState = 'closing';
        panel.dataset.state = listState;
        panel.inert = true;
        animateVideoList(from, collapsedVideoListFrame(), false);
    }

    function toggleVideoList() {
        if (state !== 'closed' || dialog.open) { return; }
        if (listState === 'opening' || listState === 'open') {
            closeVideoList(true);
            return;
        }
        var from = null;
        if (listState === 'closing') {
            var current = window.getComputedStyle(panel);
            from = { transform: current.transform, opacity: current.opacity };
        } else {
            list.scrollTop = 0;
        }
        panel.hidden = false;
        panel.inert = false;
        listState = 'opening';
        panel.dataset.state = listState;
        launcher.setAttribute('aria-expanded', 'true');
        launcher.setAttribute('aria-label', '關閉影片清單');
        panelCloseButton.focus({ preventScroll: true });
        animateVideoList(from || collapsedVideoListFrame(), { transform: 'none', opacity: 1 }, true);
    }

    function setState(value) {
        state = value;
        dialog.dataset.state = value;
    }

    function cancelMotion() {
        motionVersion += 1;
        window.clearTimeout(motionTimer);
        motionTimer = null;
        if (motion) {
            var previous = motion;
            motion = null;
            previous.cancel();
        }
        if (backdropMotion) {
            var previousBackdrop = backdropMotion;
            backdropMotion = null;
            previousBackdrop.cancel();
        }
    }

    function restorePlaybackState() {
        player.replaceChildren();
        if (scrollStyles) {
            scrollStyles.forEach(function (saved) {
                if (saved.value) {
                    saved.element.style.setProperty('overflow', saved.value, saved.priority);
                } else {
                    saved.element.style.removeProperty('overflow');
                }
            });
            scrollStyles = null;
        }
        var previousTrigger = trigger;
        trigger = null;
        activeVideo = null;
        automaticOpen = false;
        backdropPointerDown = false;
        if (previousTrigger && previousTrigger.isConnected) {
            previousTrigger.focus({ preventScroll: true });
        }
    }

    function finishClose() {
        cancelMotion();
        setState('closed');
        player.replaceChildren();
        if (dialog.open) { dialog.close(); }
        restorePlaybackState();
    }

    function showPoster() {
        var image = document.createElement('img');
        image.src = 'https://i.ytimg.com/vi/' + activeVideo.id + '/hqdefault.jpg';
        image.className = 'videoLightbox__poster';
        image.alt = '';
        image.decoding = 'async';
        player.replaceChildren(image);
    }

    function completeOpen() {
        if (state !== 'opening' || !dialog.open) { return; }
        setState('open');
        var iframe = document.createElement('iframe');
        iframe.title = activeVideo.title;
        iframe.src = 'https://www.youtube.com/embed/' + activeVideo.id
            + '?start=' + activeVideo.start + '&autoplay=1&mute=1&controls=1&playsinline=1';
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        player.replaceChildren(iframe);
    }

    function animateDialog(frames, duration, easing, complete, backdropStart) {
        cancelMotion();
        if (reducedMotion.matches || typeof dialog.animate !== 'function') {
            complete();
            return;
        }
        var version = motionVersion;
        function settle() {
            if (version !== motionVersion) { return; }
            cancelMotion();
            complete();
        }
        try {
            motion = dialog.animate(frames, {
                duration: duration,
                easing: easing,
                fill: 'both'
            });
            // Cancellation also settles the lifecycle; stale callbacks cannot reopen a closing dialog.
            motion.finished.then(settle, settle);
            backdropMotion = dialog.animate([
                { opacity: backdropStart },
                { opacity: state === 'closing' ? 0 : 1 }
            ], {
                duration: duration,
                easing: easing,
                fill: 'both',
                pseudoElement: '::backdrop'
            });
            backdropMotion.finished.then(function () {}, settle);
            // If pseudo-element animation is unsupported, show/close immediately and safely.
            if (backdropMotion.effect.pseudoElement !== '::backdrop') {
                settle();
                return;
            }
            motionTimer = window.setTimeout(settle, duration + 150);
        } catch (error) {
            settle();
        }
    }

    function thumbnailBounds(button) {
        var thumbnail = button && button.querySelector('.homeVideos__thumbnail');
        if (!thumbnail || !thumbnail.isConnected) { return null; }
        var bounds = thumbnail.getBoundingClientRect();
        var viewportWidth = document.documentElement.clientWidth;
        var viewportHeight = window.innerHeight;
        var listBounds = panel.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0
            || bounds.right <= Math.max(0, listBounds.left)
            || bounds.left >= Math.min(viewportWidth, listBounds.right)
            || bounds.bottom <= Math.max(0, listBounds.top)
            || bounds.top >= Math.min(viewportHeight, listBounds.bottom)) {
            return null;
        }
        return bounds;
    }

    function thumbnailFrame(origin, bounds) {
        if (!origin) {
            return {
                transform: 'translate(' + bounds.width * 0.02 + 'px, '
                    + bounds.height * 0.02 + 'px) scale(0.96)',
                opacity: 0
            };
        }
        return {
            transform: 'translate(' + (origin.left - bounds.left) + 'px, '
                + (origin.top - bounds.top) + 'px) scale('
                + origin.width / bounds.width + ', ' + origin.height / bounds.height + ')',
            opacity: 0
        };
    }

    function closeVideo() {
        if (state === 'closed' || state === 'closing') { return; }
        // Capture the current opening frame before cancelling, so an early close never jumps.
        var computed = window.getComputedStyle(dialog);
        var currentFrame = { transform: computed.transform, opacity: computed.opacity };
        var backdropOpacity = window.getComputedStyle(dialog, '::backdrop').opacity;
        cancelMotion();
        // Stop playback at the start of closing, while keeping a thumbnail in the player area.
        showPoster();
        if (!dialog.contains(document.activeElement)) {
            closeButton.focus({ preventScroll: true });
        }
        var bounds = dialog.getBoundingClientRect();
        var targetFrame = automaticOpen
            ? { transform: 'none', opacity: 0 }
            : thumbnailFrame(null, bounds);
        setState('closing');
        backdropPointerDown = false;
        animateDialog([currentFrame, targetFrame], 260, 'cubic-bezier(0.4, 0, 1, 1)', finishClose, backdropOpacity);
    }

    function openVideo(video, button, automatic) {
        if (state !== 'closed' || dialog.open) { return; }
        if (typeof dialog.showModal !== 'function') {
            if (automatic) { return; }
            closeVideoList(true, true);
            window.open('https://www.youtube.com/watch?v=' + video.id + '&t=' + video.start + 's',
                '_blank', 'noopener');
            return;
        }
        var origin = automatic ? null : thumbnailBounds(button);
        closeVideoList(false, true);
        trigger = launcher;
        activeVideo = video;
        automaticOpen = !!automatic;
        dialog.setAttribute('aria-label', '影片介紹：' + video.title);
        dismissCheckbox.checked = readDismissed();
        showPoster();
        scrollStyles = [document.documentElement, document.body].map(function (element) {
            var saved = {
                element: element,
                value: element.style.getPropertyValue('overflow'),
                priority: element.style.getPropertyPriority('overflow')
            };
            element.style.setProperty('overflow', 'hidden');
            return saved;
        });
        try {
            dialog.showModal();
            dialog.scrollTop = 0;
        } catch (error) {
            finishClose();
            return;
        }
        var bounds = dialog.getBoundingClientRect();
        setState('opening');
        closeButton.focus({ preventScroll: true });
        var frames = automaticOpen
            ? [{ opacity: 0 }, { opacity: 1 }]
            : [thumbnailFrame(origin, bounds), { transform: 'none', opacity: 1 }];
        animateDialog(frames, automaticOpen ? 200 : 320,
            'cubic-bezier(0.22, 1, 0.36, 1)', completeOpen, 0);
    }

    function settleForResize() {
        if (listState === 'opening' || listState === 'closing') {
            finishVideoList(listState === 'opening');
        }
        if (state === 'opening') {
            cancelMotion();
            completeOpen();
        } else if (state === 'closing') {
            finishClose();
        }
    }

    setState('closed');

    videos.forEach(function (video) {
        var item = document.createElement('li');
        item.className = 'homeVideos__item';
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'homeVideos__card';
        button.setAttribute('aria-haspopup', 'dialog');
        button.setAttribute('aria-controls', 'videoLightbox');
        button.setAttribute('aria-label', '播放影片：' + video.title);
        var thumbnail = document.createElement('span');
        thumbnail.className = 'homeVideos__thumbnail';
        var image = document.createElement('img');
        image.src = 'https://i.ytimg.com/vi/' + video.id + '/hqdefault.jpg';
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        var play = document.createElement('span');
        play.className = 'homeVideos__play';
        play.setAttribute('aria-hidden', 'true');
        thumbnail.append(image, play);
        var label = document.createElement('span');
        label.className = 'homeVideos__title';
        label.textContent = video.cardTitle || video.title;
        button.append(thumbnail, label);
        button.addEventListener('click', function () { openVideo(video, button); });
        item.appendChild(button);
        list.appendChild(item);
    });
    widget.hidden = videos.length === 0;

    launcher.addEventListener('click', toggleVideoList);
    panelCloseButton.addEventListener('click', function () { closeVideoList(true); });
    document.addEventListener('click', function (event) {
        if (!panel.hidden && !widget.contains(event.target)) { closeVideoList(false); }
    }, true);
    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && !panel.hidden && !dialog.open) {
            event.preventDefault();
            event.stopImmediatePropagation();
            closeVideoList(true);
        }
    }, true);

    function trapDialogFocus(event) {
        if (event.key !== 'Tab') { return; }
        var modal = event.currentTarget;
        var controls = Array.prototype.slice.call(modal.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex]'
        )).filter(function (element) {
            return element.tabIndex >= 0 && element.getClientRects().length > 0
                && window.getComputedStyle(element).visibility !== 'hidden';
        });
        var first = controls[0];
        var last = controls[controls.length - 1];
        if (!first) { return; }
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
    dialog.addEventListener('keydown', trapDialogFocus);
    document.addEventListener('focusin', function (event) {
        if (dialog.open && !dialog.contains(event.target)) {
            closeButton.focus({ preventScroll: true });
        }
    });
    dismissCheckbox.addEventListener('change', saveDismissed);
    closeButton.addEventListener('click', closeVideo);
    dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeVideo();
    });
    dialog.addEventListener('close', function () {
        if (!dialog.open && state !== 'closed') { finishClose(); }
    });
    function outsideDialog(event, modal) {
        var bounds = (modal || dialog).getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right
            || event.clientY < bounds.top || event.clientY > bounds.bottom;
    }
    dialog.addEventListener('pointerdown', function (event) {
        backdropPointerDown = event.target === dialog && outsideDialog(event);
    });
    dialog.addEventListener('click', function (event) {
        if (backdropPointerDown && event.target === dialog && outsideDialog(event)) {
            closeVideo();
        }
        backdropPointerDown = false;
    });
    window.addEventListener('resize', settleForResize);
    reducedMotion.addEventListener('change', function () {
        if (reducedMotion.matches) { settleForResize(); }
    });
    window.addEventListener('pagehide', function () {
        closeVideoList(false, true);
        finishClose();
    });

    if (videos.length && !readDismissed()) {
        openVideo(videos[0], null, true);
    }
})(window, document);
