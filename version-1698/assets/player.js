import { H as Hls } from './hls-dru42stk.js';

function initPlayer(card) {
  var video = card.querySelector('video');
  var button = card.querySelector('.player-start');
  var message = card.querySelector('[data-player-message]');
  var source = card.getAttribute('data-src');
  var hlsInstance = null;
  var initialized = false;

  function setMessage(text) {
    if (message) {
      message.textContent = text || '';
    }
  }

  function attachSource() {
    if (!source) {
      setMessage('当前影片暂无可用播放源。');
      return false;
    }

    if (initialized) {
      return true;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      initialized = true;
      return true;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setMessage('播放源加载失败，请稍后重试。');
        }
      });
      initialized = true;
      return true;
    }

    setMessage('当前浏览器不支持 HLS 播放。');
    return false;
  }

  function start() {
    setMessage('');

    if (!attachSource()) {
      return;
    }

    card.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        setMessage('浏览器阻止了自动播放，请再次点击播放器开始播放。');
        card.classList.remove('is-playing');
      });
    }
  }

  if (button) {
    button.addEventListener('click', start);
  }

  video.addEventListener('play', function () {
    card.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    if (!video.currentTime) {
      card.classList.remove('is-playing');
    }
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-player]').forEach(initPlayer);
});
