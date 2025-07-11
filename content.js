(() => {
  const resultsSelector = 'div#search a > h3'; // h3 inside links of results
  let results = [];
  let currentIndex = -1;

  // CSS for highlight
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav-highlight {
      border-radius: 4px;
      outline: 2px solid #4285f4 !important;
    }
  `;
  document.head.appendChild(style);

  function updateResults() {
    results = Array.from(document.querySelectorAll(resultsSelector))
      .map(h3 => h3.parentElement)
      .filter(el => el.href); // filter out non-links just in case
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
      currentIndex = (currentIndex + 1) % results.length;
      highlight(currentIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + results.length) % results.length;
      highlight(currentIndex);
    } else if (e.key === 'Enter') {
      if (currentIndex >= 0 && currentIndex < results.length) {
        e.preventDefault();
        const url = results[currentIndex].href;
        if (e.ctrlKey || e.metaKey) {
          window.open(url, '_blank');
        } else {
          window.location.href = url;
        }
      }
    }
  }

  // Handle Google's dynamic page loads (e.g. Instant Search)
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
