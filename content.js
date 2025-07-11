(() => {
  const resultsContainerSelector = 'div#search';
  const resultItemSelector = 'div.g';

  let results = [];
  let currentIndex = -1;

  // Add CSS for highlight
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav-highlight {
      background-color: #d2e3fc !important;
      border-radius: 6px;
      outline: 2px solid #4285f4 !important;
      transition: background-color 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  function updateResults() {
    const container = document.querySelector(resultsContainerSelector);
    if (!container) {
      results = [];
      return;
    }
    // Filter .g divs that contain an <h3> inside a link, to ensure these are main results
    results = Array.from(container.querySelectorAll(resultItemSelector)).filter(g => {
      const linkWithH3 = g.querySelector('a > h3');
      return linkWithH3 && g.offsetParent !== null; // visible
    });
  }

  function clearHighlight() {
    results.forEach(el => el.classList.remove('keyboard-nav-highlight'));
  }

  function highlight(index) {
    clearHighlight();
    if (index >= 0 && index < results.length) {
      const el = results[index];
      el.classList.add('keyboard-nav-highlight');
      el.scrollIntoView({behavior: 'smooth', block: 'center'});
    }
  }

  function isTyping() {
    const active = document.activeElement;
    if (!active) return false;
    const tag = active.tagName.toLowerCase();
    return tag === 'input' || tag === 'textarea' || active.isContentEditable;
  }

  function onKeyDown(e) {
    if (isTyping()) return;

    updateResults();
    if (results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentIndex < results.length - 1) {
        currentIndex++;
        highlight(currentIndex);
      }
      // else do nothing to avoid wrapping
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex > 0) {
        currentIndex--;
        highlight(currentIndex);
      }
      // else do nothing to avoid wrapping
    } else if (e.key === 'Enter') {
      if (currentIndex >= 0 && currentIndex < results.length) {
        e.preventDefault();
        const el = results[currentIndex];
        const link = el.querySelector('a[href]');
        if (link) {
          const url = link.href;
          if (e.ctrlKey || e.metaKey) {
            window.open(url, '_blank');
          } else {
            window.location.href = url;
          }
        }
      }
    }
  }

  // Handle Google's dynamic content updates
  const observer = new MutationObserver(() => {
    updateResults();
    if (currentIndex >= results.length) {
      currentIndex = -1;
      clearHighlight();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('keydown', onKeyDown);

  // Initial load
  updateResults();
})();
