/**
 * 每日一卦 · Daily Hexagram
 * Frontend Application Logic
 */

(function() {
  'use strict';

  // Section icon mapping
  const SECTION_ICONS = {
    '出行日期吉凶': '⏰',
    '出行工具建议': '🚗',
    '财运解读': '💰',
    '遇见贵人的概率': '🙏',
    '贵人外貌及衣着': '👤',
    '贵人外貌': '👤',
    '桃花运机率': '💕',
    '搭讪的成功率': '💬',
    '工作的顺利程度': '💼',
    '目的地天气': '🌤',
    '健康状态': '💪',
    '目的地的美食': '🍜',
    '小结': '📌',
    '八字命局': '🔮',
    '起卦结果': '䷀',
    '爻辞解读': '📜',
    '命理与出行建议': '🧭',
    '吉凶判断': '⚖️',
  };

  // Section accent colors
  const SECTION_COLORS = {
    '出行日期吉凶': '#e74c3c',
    '出行工具建议': '#3498db',
    '财运解读': '#f39c12',
    '遇见贵人的概率': '#9b59b6',
    '贵人外貌及衣着': '#9b59b6',
    '桃花运机率': '#e91e63',
    '搭讪的成功率': '#e91e63',
    '工作的顺利程度': '#2ecc71',
    '目的地天气': '#3498db',
    '健康状态': '#2ecc71',
    '目的地的美食': '#e67e22',
    '小结': '#c9a227',
    '八字命局': '#c9a227',
    '起卦结果': '#c9a227',
    '爻辞解读': '#c9a227',
    '命理与出行建议': '#c9a227',
    '吉凶判断': '#e74c3c',
  };

  // DOM Elements
  const form = document.getElementById('divinationForm');
  const submitBtn = document.getElementById('submitBtn');
  const resultCard = document.getElementById('resultCard');
  const resultContent = document.getElementById('resultContent');
  const loadingOverlay = document.getElementById('loadingOverlay');
  const retryBtn = document.getElementById('retryBtn');

  // State
  let isLoading = false;

  function init() {
    form.addEventListener('submit', handleSubmit);
    retryBtn.addEventListener('click', handleRetry);
    checkApiHealth();
  }

  async function checkApiHealth() {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      if (!data.hasApiKey) {
        showApiKeyWarning();
      }
    } catch (error) {
      console.warn('Health check failed:', error);
    }
  }

  function showApiKeyWarning() {
    const warning = document.createElement('div');
    warning.className = 'api-warning';
    warning.innerHTML = `
      <p>⚠️ 尚未配置 DeepSeek API Key</p>
      <p>请在 <code>server/.env</code> 文件中添加：</p>
      <code>DEEPSEEK_API_KEY=your_api_key_here</code>
    `;
    warning.style.cssText = `
      background: rgba(184, 58, 58, 0.1);
      border: 1px solid var(--vermilion);
      border-radius: 3px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      font-size: 0.85rem;
      color: var(--vermilion-light);
      text-align: center;
    `;
    form.insertBefore(warning, form.firstChild);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isLoading) return;

    const formData = {
      name: document.getElementById('name').value.trim(),
      birthDate: document.getElementById('birthDate').value,
      phone: document.getElementById('phone').value.trim(),
      departure: document.getElementById('departure').value.trim(),
      destination: document.getElementById('destination').value.trim(),
      departureTime: document.getElementById('departureTime').value
    };

    if (!formData.name || !formData.birthDate) {
      showError('请填写必填项：姓名、出生日期');
      return;
    }

    setLoading(true);
    hideError();

    try {
      const response = await fetch('/api/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '占卜失败，请稍后重试');
      }

      displayResult(data.reading);
    } catch (error) {
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }

  /**
   * Parse the reading text into structured sections
   */
  function parseSections(reading) {
    // Remove disclaimer
    reading = reading.replace(/✨以上内容由DeepSeek生成[\s\S]*/i, '').replace(/✍️以上推算由AI生成[\s\S]*/i, '').trim();

    const sections = [];
    // Match 【title】 followed by content until next 【 or end
    const regex = /【([^】]+)】\s*([\s\S]*?)(?=【[^】]+】|$)/g;
    let match;
    while ((match = regex.exec(reading)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      if (title && content) {
        sections.push({ title, content });
      }
    }
    // If no sections found, return the raw text as one section
    if (sections.length === 0) {
      sections.push({ title: '卦象解读', content: reading.trim() });
    }
    return sections;
  }

  /**
   * Render a single section card
   */
  function renderSection(section, index) {
    const icon = SECTION_ICONS[section.title] || '✦';
    const color = SECTION_COLORS[section.title] || '#c9a227';

    // Format content: highlight key phrases
    let content = section.content
      .replace(/---/g, '')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .trim();

    // Highlight percentage-like patterns
    content = content.replace(/(\d+[%％])/g, '<span class="highlight-stat">$1</span>');

    // Highlight 吉/凶/平 patterns
    content = content.replace(/(大吉|吉|小吉|平|小凶|凶|大凶)/g, '<span class="highlight-verdict">$1</span>');

    // Convert line breaks to paragraphs
    const paragraphs = content.split(/\n+/).filter(p => p.trim());
    const contentHtml = paragraphs.map(p => `<p>${p}</p>`).join('');

    const card = document.createElement('div');
    card.className = section.title === '小结' ? 'result-section section-summary' : 'result-section';
    card.style.setProperty('--section-color', color);
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
      <div class="section-header">
        <span class="section-icon">${icon}</span>
        <span class="section-title-text">${section.title}</span>
      </div>
      <div class="section-body">${contentHtml}</div>
    `;

    return card;
  }

  /**
   * Display the divination result
   */
  function displayResult(reading) {
    const sections = parseSections(reading);

    // Clear previous content
    resultContent.innerHTML = '';

    // Add gua symbol header if the reading contains one
    const guaMatch = reading.match(/[䷀-䷿]/);
    const guaHeader = document.createElement('div');
    guaHeader.className = 'gua-header';
    guaHeader.innerHTML = `
      <div class="gua-symbol">${guaMatch ? guaMatch[0] : '䷀'}</div>
      <div class="gua-divider">
        <span class="divider-line"></span>
        <span class="divider-dot">✦</span>
        <span class="divider-line"></span>
      </div>
    `;
    resultContent.appendChild(guaHeader);

    // Render each section
    sections.forEach((section, index) => {
      const card = renderSection(section, index);
      resultContent.appendChild(card);
    });

    // Hide form, show result
    form.style.display = 'none';
    resultCard.classList.add('show');
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleRetry() {
    resultCard.classList.remove('show');
    resultContent.innerHTML = '';
    form.style.display = 'grid';
    form.reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setLoading(loading) {
    isLoading = loading;
    submitBtn.disabled = loading;
    if (loading) {
      loadingOverlay.classList.add('show');
      submitBtn.querySelector('.btn-text').textContent = '占卜中...';
    } else {
      loadingOverlay.classList.remove('show');
      submitBtn.querySelector('.btn-text').textContent = '起 卦';
    }
  }

  function showError(message) {
    hideError();
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    form.appendChild(errorEl);
    setTimeout(() => { if (errorEl.parentNode) errorEl.remove(); }, 5000);
  }

  function hideError() {
    const existingError = form.querySelector('.error-message');
    if (existingError) existingError.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
