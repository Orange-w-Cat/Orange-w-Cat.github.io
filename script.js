(() => {
  const demo = document.querySelector('.code-policy-demo');
  if (!demo) return;

  const stage = demo.querySelector('.compare-stage');
  const sim = demo.querySelector('.compare-sim');
  const real = demo.querySelector('.compare-real');
  const split = demo.querySelector('.split-control');
  const timeline = demo.querySelector('.timeline-control');
  const toggle = demo.querySelector('.play-toggle');
  const toggleIcon = toggle.querySelector('span');
  const currentLabel = demo.querySelector('.time-current');
  const totalLabel = demo.querySelector('.time-total');
  const collection = document.querySelector('.collection-video');

  const simDuration = Number(demo.dataset.simDuration) || 562;
  const realDuration = Number(demo.dataset.realDuration) || 563.133333;
  const realScale = realDuration / simDuration;
  let animationFrame = 0;

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.min(simDuration, Number(seconds) || 0));
    const minutes = Math.floor(safe / 60);
    const secs = Math.floor(safe % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  const forceMuted = () => {
    for (const video of [sim, real, collection].filter(Boolean)) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    }
  };

  const setButtonState = (playing) => {
    toggleIcon.textContent = playing ? 'Ⅱ' : '▶';
    toggle.lastChild.textContent = playing ? ' Pause both' : ' Play both';
    toggle.setAttribute('aria-label', playing ? 'Pause both synchronized videos' : 'Play both synchronized videos');
  };

  const seekTogether = (commonTime) => {
    const t = Math.max(0, Math.min(simDuration, Number(commonTime) || 0));
    sim.currentTime = t;
    real.currentTime = Math.min(realDuration, t * realScale);
    timeline.value = String(t);
    currentLabel.textContent = formatTime(t);
  };

  const updateTimeline = () => {
    const t = Math.min(simDuration, sim.currentTime || 0);
    timeline.value = String(t);
    currentLabel.textContent = formatTime(t);

    const expectedRealTime = Math.min(realDuration, t * realScale);
    if (!real.seeking && Math.abs((real.currentTime || 0) - expectedRealTime) > 0.22) {
      real.currentTime = expectedRealTime;
    }

    if (!sim.paused && !sim.ended) {
      animationFrame = requestAnimationFrame(updateTimeline);
    } else {
      setButtonState(false);
    }
  };

  const playTogether = async () => {
    forceMuted();
    collection?.pause();
    if (sim.currentTime >= simDuration - 0.05) seekTogether(0);
    real.playbackRate = realScale;
    sim.playbackRate = 1;
    real.currentTime = Math.min(realDuration, sim.currentTime * realScale);
    const outcomes = await Promise.allSettled([sim.play(), real.play()]);
    if (outcomes.every((result) => result.status === 'fulfilled')) {
      setButtonState(true);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateTimeline);
    } else {
      sim.pause();
      real.pause();
      setButtonState(false);
    }
  };

  const pauseTogether = () => {
    sim.pause();
    real.pause();
    cancelAnimationFrame(animationFrame);
    setButtonState(false);
  };

  split.addEventListener('input', () => {
    stage.style.setProperty('--split', `${split.value}%`);
  });

  timeline.addEventListener('input', () => {
    seekTogether(timeline.value);
  });

  toggle.addEventListener('click', () => {
    if (sim.paused) playTogether();
    else pauseTogether();
  });

  sim.addEventListener('ended', () => {
    pauseTogether();
    seekTogether(simDuration);
  });

  for (const video of [sim, real]) {
    video.addEventListener('volumechange', forceMuted);
    video.addEventListener('click', () => {
      if (sim.paused) playTogether();
      else pauseTogether();
    });
  }

  if (collection) {
    collection.addEventListener('play', pauseTogether);
    collection.addEventListener('volumechange', forceMuted);
  }

  forceMuted();
  timeline.max = String(simDuration);
  totalLabel.textContent = formatTime(simDuration);
  setButtonState(false);
})();
