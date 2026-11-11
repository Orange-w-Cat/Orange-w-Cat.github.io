(() => {
  const demo = document.querySelector('.compare-demo');
  if (!demo) return;
  const stage = demo.querySelector('.compare-stage');
  const sim = demo.querySelector('.compare-sim');
  const real = demo.querySelector('.compare-real');
  const split = demo.querySelector('.split-control');
  const timeline = demo.querySelector('.timeline-control');
  const toggle = demo.querySelector('.play-toggle');
  const currentLabel = demo.querySelector('.time-current');
  const totalLabel = demo.querySelector('.time-total');
  const simDuration = Number(demo.dataset.simDuration) || 562;
  const realDuration = Number(demo.dataset.realDuration) || 563.133333;
  const realScale = realDuration / simDuration;
  let animationFrame = 0;

  const formatTime = (seconds) => {
    const safe = Math.max(0, Math.min(simDuration, Number(seconds) || 0));
    return `${Math.floor(safe / 60)}:${Math.floor(safe % 60).toString().padStart(2, '0')}`;
  };
  const forceMuted = () => {
    [sim, real, ...document.querySelectorAll('.collection-panel video')].forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    });
  };
  const setButtonState = (playing) => {
    toggle.innerHTML = `<span aria-hidden="true">${playing ? 'Ⅱ' : '▶'}</span> ${playing ? 'Pause both' : 'Play both'}`;
    toggle.setAttribute('aria-label', playing ? 'Pause both synchronized videos' : 'Play both synchronized videos');
  };
  const seekTogether = (commonTime) => {
    const time = Math.max(0, Math.min(simDuration, Number(commonTime) || 0));
    sim.currentTime = time;
    real.currentTime = Math.min(realDuration, time * realScale);
    timeline.value = String(time);
    currentLabel.textContent = formatTime(time);
  };
  const updateTimeline = () => {
    const time = Math.min(simDuration, sim.currentTime || 0);
    timeline.value = String(time);
    currentLabel.textContent = formatTime(time);
    const expectedRealTime = Math.min(realDuration, time * realScale);
    if (!real.seeking && Math.abs((real.currentTime || 0) - expectedRealTime) > .22) real.currentTime = expectedRealTime;
    if (!sim.paused && !sim.ended) animationFrame = requestAnimationFrame(updateTimeline);
    else setButtonState(false);
  };
  const pauseTogether = () => {
    sim.pause();
    real.pause();
    cancelAnimationFrame(animationFrame);
    setButtonState(false);
  };
  const playTogether = async () => {
    forceMuted();
    document.querySelectorAll('.collection-panel video').forEach((video) => video.pause());
    if (sim.currentTime >= simDuration - .05) seekTogether(0);
    real.playbackRate = realScale;
    real.currentTime = Math.min(realDuration, sim.currentTime * realScale);
    const outcomes = await Promise.allSettled([sim.play(), real.play()]);
    if (outcomes.every((result) => result.status === 'fulfilled')) {
      setButtonState(true);
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(updateTimeline);
    } else pauseTogether();
  };

  split.addEventListener('input', () => stage.style.setProperty('--split', `${split.value}%`));
  timeline.addEventListener('input', () => seekTogether(timeline.value));
  toggle.addEventListener('click', () => sim.paused ? playTogether() : pauseTogether());
  sim.addEventListener('ended', () => { pauseTogether(); seekTogether(simDuration); });
  [sim, real].forEach((video) => {
    video.addEventListener('volumechange', forceMuted);
    video.addEventListener('click', () => sim.paused ? playTogether() : pauseTogether());
  });
  document.querySelectorAll('.collection-panel video').forEach((video) => video.addEventListener('play', pauseTogether));
  forceMuted();
  timeline.max = String(simDuration);
  totalLabel.textContent = formatTime(simDuration);
  setButtonState(false);
})();
