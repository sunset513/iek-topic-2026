(function (window, document) {
    'use strict';

    // Add videos here in their display order. start is measured in seconds.
    var videos = [
        {
            id: 'BwfFtaZyA9g',
            cardTitle: '影片介紹',
            episode: 'EP1',
            episodeTitle: 'AI 主播 iKi',
            title: '跟著 AI 主播 iKi，掌握下一個十年的無人自主產業布局！',
            description: [
                '無人機只會送貨？工研院：全球 4 萬家新創正在搶進這條全新賽道！',
                '能看見、會思考、懂應變—「實體 AI」正式走向台前！它不是為了取代人，而是延伸人類能力的關鍵基礎設施。'
            ],
            start: 1
        }
    ];
    var list = document.getElementById('homeVideoList');
    var dialog = document.getElementById('videoLightbox');
    var player = document.getElementById('videoLightboxPlayer');
    var title = document.getElementById('videoLightboxTitle');
    var closeButton = document.getElementById('closeVideoLightbox');
    var episode = document.getElementById('videoLightboxEpisode');
    var description = document.getElementById('videoLightboxDescription');
    var currentEpisode = document.getElementById('videoCurrentEpisode');
    var episodeSummary = document.getElementById('videoEpisodeSummary');
    var shareButton = document.getElementById('shareVideo');
    var copyButton = document.getElementById('copyVideoLink');
    var panelCopyButton = document.getElementById('videoPanelCopy');
    var sharePanel = document.getElementById('videoSharePanel');
    var shareStatus = document.getElementById('videoShareStatus');
    var shareUrl = document.getElementById('videoShareUrl');
    var lineShare = document.getElementById('videoLineShare');
    var facebookShare = document.getElementById('videoFacebookShare');

    if (!list || !dialog || !player || !title || !closeButton || !episode || !description
        || !currentEpisode || !episodeSummary || !shareButton || !copyButton || !panelCopyButton
        || !sharePanel || !shareStatus || !shareUrl || !lineShare || !facebookShare) { return; }

    var trigger = null;
    var activeVideo = null;
    var interactionVersion = 0;
    var scrollStyles = null;
    var backdropPointerDown = false;
    var state = 'closed';
    var motion = null;
    var backdropMotion = null;
    var motionTimer = null;
    var motionVersion = 0;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    function videoUrl(video) {
        var url = new URL('https://www.youtube.com/watch');
        url.searchParams.set('v', video.id);
        url.searchParams.set('t', video.start + 's');
        return url.href;
    }

    function resetShareUi() {
        sharePanel.hidden = true;
        shareButton.setAttribute('aria-expanded', 'false');
        shareStatus.textContent = '';
        shareUrl.value = '';
        lineShare.removeAttribute('href');
        facebookShare.removeAttribute('href');
    }

    function setVideoDetails(video) {
        title.textContent = video.title;
        episode.textContent = video.episode;
        currentEpisode.textContent = video.episode;
        episodeSummary.textContent = video.episodeTitle;
        description.replaceChildren();
        video.description.forEach(function (text) {
            var paragraph = document.createElement('p');
            paragraph.textContent = text;
            description.appendChild(paragraph);
        });
        resetShareUi();
    }

    function showShareOptions(url) {
        shareUrl.value = url;
        lineShare.href = 'https://social-plugins.line.me/lineit/share?url=' + encodeURIComponent(url);
        facebookShare.href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        sharePanel.hidden = false;
        shareButton.setAttribute('aria-expanded', 'true');
    }

    function currentInteraction(version) {
        return version === interactionVersion && state === 'open' && !!activeVideo;
    }

    async function copyVideoLink() {
        if (state !== 'open' || !activeVideo) { return; }
        var version = interactionVersion;
        var url = videoUrl(activeVideo);
        try {
            if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
                throw new Error('Clipboard unavailable');
            }
            await navigator.clipboard.writeText(url);
            if (currentInteraction(version)) { shareStatus.textContent = '已複製連結'; }
        } catch (error) {
            if (!currentInteraction(version)) { return; }
            showShareOptions(url);
            shareUrl.focus();
            shareUrl.select();
            shareStatus.textContent = '請複製已選取的連結';
        }
    }

    async function shareVideo() {
        if (state !== 'open' || !activeVideo) { return; }
        var version = interactionVersion;
        var data = { title: activeVideo.title, url: videoUrl(activeVideo) };
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share(data);
                return;
            } catch (error) {
                if (error.name === 'AbortError' || !currentInteraction(version)) { return; }
            }
        }
        if (currentInteraction(version)) { showShareOptions(data.url); }
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
        interactionVersion += 1;
        resetShareUi();
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
        var thumbnail = trigger && trigger.querySelector('.homeVideos__thumbnail img');
        image.src = thumbnail && (thumbnail.currentSrc || thumbnail.src)
            || 'https://i.ytimg.com/vi/' + activeVideo.id + '/hqdefault.jpg';
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
            + '?start=' + activeVideo.start + '&autoplay=1&controls=1&playsinline=1';
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

    function thumbnailBounds() {
        var thumbnail = trigger && trigger.querySelector('.homeVideos__thumbnail');
        if (!thumbnail || !thumbnail.isConnected) { return null; }
        var bounds = thumbnail.getBoundingClientRect();
        var viewportWidth = document.documentElement.clientWidth;
        var viewportHeight = window.innerHeight;
        var listBounds = list.getBoundingClientRect();
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
        interactionVersion += 1;
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
        var targetFrame = thumbnailFrame(thumbnailBounds(), bounds);
        setState('closing');
        backdropPointerDown = false;
        animateDialog([currentFrame, targetFrame], 260, 'cubic-bezier(0.4, 0, 1, 1)', finishClose, backdropOpacity);
    }

    function openVideo(video, button) {
        if (state !== 'closed' || dialog.open) { return; }
        if (typeof dialog.showModal !== 'function') {
            window.open('https://www.youtube.com/watch?v=' + video.id + '&t=' + video.start + 's',
                '_blank', 'noopener,noreferrer');
            return;
        }
        trigger = button;
        activeVideo = video;
        var origin = thumbnailBounds();
        interactionVersion += 1;
        setVideoDetails(video);
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
        animateDialog([
            thumbnailFrame(origin, bounds),
            { transform: 'none', opacity: 1 }
        ], 320, 'cubic-bezier(0.22, 1, 0.36, 1)', completeOpen, 0);
    }

    function settleForResize() {
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
    list.parentElement.hidden = videos.length === 0;

    // The inline share controls join the native dialog's keyboard focus cycle.
    dialog.addEventListener('keydown', function (event) {
        if (event.key !== 'Tab') { return; }
        var controls = Array.prototype.slice.call(dialog.querySelectorAll(
            'button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex]'
        )).filter(function (element) {
            return element.tabIndex >= 0 && element.getClientRects().length > 0
                && window.getComputedStyle(element).visibility !== 'hidden';
        });
        var first = controls[0];
        var last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });

    document.addEventListener('focusin', function (event) {
        if (dialog.open && !dialog.contains(event.target)) { closeButton.focus(); }
    });
    shareButton.addEventListener('click', shareVideo);
    copyButton.addEventListener('click', copyVideoLink);
    panelCopyButton.addEventListener('click', copyVideoLink);
    closeButton.addEventListener('click', closeVideo);
    dialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeVideo();
    });
    dialog.addEventListener('close', function () {
        if (!dialog.open && state !== 'closed') { finishClose(); }
    });
    function outsideDialog(event) {
        var bounds = dialog.getBoundingClientRect();
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
    window.addEventListener('pagehide', finishClose);
})(window, document);
