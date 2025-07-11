(() => {
  const resultsSelector = 'div#search a > h3'; // h3 inside links of results
  let results = [];
  let currentIndex = -1;

  // CSS for highlight and arrow
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-nav-highlight {
      border-radius: 4px;
      outline: 2px solid #4285f4 !important;
      position: relative;
    }
    .keyboard-nav-arrow {
      position: absolute;
      left: -20px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 8px solid #4285f4;
      z-index: 1000;
    }
    .keyboard-nav-highlight::before {
      content: '';
      position: absolute;
      left: -20px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 8px solid #4285f4;
      z-index: 1000;
    }
  `;
  document.head.appendChild(style);

  function updateResults() {
    // Get all result elements, filtering out "People also ask" section
    const allResults = Array.from(document.querySelectorAll(resultsSelector))
      .map(h3 => h3.parentElement)
      .filter(el => {
        if (!el.href) return false;
        
        // Skip "People also ask" section
        const parentSection = el.closest('[data-initq], [data-q]');
        if (parentSection && parentSection.querySelector('[role="button"]')) {
          return false;
        }
        
        // Additional check for PAA by looking for specific patterns
        const resultContainer = el.closest('div[data-ved]');
        if (resultContainer) {
          const hasExpandButton = resultContainer.querySelector('g-expandable-container, [jsaction*="expand"]');
          if (hasExpandButton) return false;
        }
        
        return true;
      });
    
    results = allResults;
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

  function autoFocusFirst() {
    updateResults();
    if (results.length > 0) {
      currentIndex = 0;
      highlight(currentIndex);
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
      if (currentIndex === -1) {
        currentIndex = 0;
      } else {
        currentIndex = (currentIndex + 1) % results.length;
      }
      highlight(currentIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex === -1) {
        currentIndex = results.length - 1;
      } else {
        currentIndex = (currentIndex - 1 + results.length) % results.length;
      }
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
    const previousResultsLength = results.length;
    updateResults();
    
    // If results changed and we had no selection, auto-focus first
    if (previousResultsLength === 0 && results.length > 0 && currentIndex === -1) {
      autoFocusFirst();
    }
    
    if (currentIndex >= results.length) {
      currentIndex = -1;
      clearHighlight();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('keydown', onKeyDown);

  // Initial load with auto-focus
  setTimeout(() => {
    autoFocusFirst();
  }, 100); // Small delay to ensure DOM is ready
})();