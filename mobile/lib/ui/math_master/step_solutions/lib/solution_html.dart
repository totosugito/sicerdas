String getSolutionHtml({
  required String module,
  required String chapter,
  required String question,
  required String solution,
  required String answer,
  required String labelCopyright,
  required String labelQuestion,
  required String labelSteps,
  required String labelResult,
}) {
  return '''
  <style>
    
    /* Premium modern theme tokens */
    :root {
      --bg-body: #fbfbfb;
      --text-body: #44403c;
      --border-color: #f2f0ea;
      --border-subtle: rgba(0, 0, 0, 0.04);
      --card-bg: #ffffff;
      
      --badge-bg: #eff6ff;
      --badge-text: #1d4ed8;
      
      --text-muted: #8c8a82;
      --text-heading: #1c1917;
      
      --accent-gradient: linear-gradient(135deg, #3b82f6, #6366f1);
      --success-gradient: linear-gradient(135deg, #10b981, #059669);
      
      --grid-dot: rgba(0, 0, 0, 0.04);
      --success-bg: #f0fdf4;
      --success-border: #d1fae5;
      --success-text: #065f46;
    }

    .dark {
      --bg-body: #0c0a09;
      --text-body: #d6d3d1;
      --border-color: rgba(68, 64, 60, 0.6);
      --border-subtle: rgba(255, 255, 255, 0.04);
      --card-bg: rgba(28, 25, 23, 0.7);
      
      --badge-bg: rgba(30, 58, 138, 0.4);
      --badge-text: #60a5fa;
      
      --text-muted: #8c827a;
      --text-heading: #ffffff;
      
      --grid-dot: rgba(255, 255, 255, 0.03);
      --success-bg: rgba(6, 78, 59, 0.2);
      --success-border: rgba(4, 120, 87, 0.4);
      --success-text: #a7f3d0;
    }

    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      background-color: var(--bg-body);
      color: var(--text-body);
      padding: 1.5rem 1.25rem;
      margin: 0;
      transition: background-color 0.3s, color 0.3s;
    }
    
    .container {
      max-width: 36rem;
      margin-left: auto;
      margin-right: auto;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    /* Header Area */
    .header-area {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }
    
    .badge-container {
      display: inline-flex;
    }
    
    .badge {
      display: inline-flex;
      align-items: center;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background-color: var(--badge-bg);
      color: var(--badge-text);
      padding: 0.3rem 0.75rem;
      border-radius: 9999px;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
    }
    
    .title {
      font-size: 1.625rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-heading);
      line-height: 1.2;
      margin: 0;
    }
    
    /* Card Styles */
    .card {
      position: relative;
      overflow: hidden;
      background-color: var(--card-bg);
      padding: 1.5rem;
      border-radius: 1.25rem;
      border: 1px solid var(--border-color);
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.01);
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
      backdrop-filter: blur(10px);
    }
    
    /* Mathematical Grid background for the question */
    .math-grid {
      background-image: radial-gradient(var(--grid-dot) 1.5px, transparent 1.5px);
      background-size: 20px 20px;
    }
    
    .card-accent-top {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--accent-gradient);
    }
    
    .label-muted {
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    
    .content-bold {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--text-heading);
      line-height: 1.45;
      margin: 0;
    }
    
    .content-normal {
      color: var(--text-body);
      line-height: 1.625;
      margin: 0;
    }

    /* Connected Stepper Steps */
    #solution-text ol {
      list-style-type: none;
      counter-reset: step-counter;
      padding-left: 0;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      position: relative;
    }

    #solution-text ol > li {
      position: relative;
      counter-increment: step-counter;
      padding-left: 3rem;
      margin-bottom: 2rem;
      font-size: 0.975rem;
      line-height: 1.6;
    }
    
    #solution-text ol > li:last-child {
      margin-bottom: 0.5rem;
    }

    /* Vertical Timeline Connector Line */
    #solution-text ol > li::after {
      content: '';
      position: absolute;
      left: 0.95rem; /* Exactly horizontal center of the circle */
      top: 2rem;
      bottom: -2.2rem;
      width: 2px;
      background-color: var(--border-color);
      z-index: 0;
    }

    #solution-text ol > li:last-child::after {
      display: none;
    }

    /* Step Circle Badge */
    #solution-text ol > li::before {
      content: counter(step-counter);
      position: absolute;
      left: 0;
      top: 0.05rem;
      width: 1.9rem;
      height: 1.9rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
      z-index: 1;
      box-shadow: 0 4px 12px rgba(29, 78, 216, 0.2);
    }

    .dark #solution-text ol > li::before {
      background: linear-gradient(135deg, #60a5fa, #2563eb);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
    }

    /* Math Equations inside Stepper */
    #solution-text .katex-display {
      margin: 0.75rem 0;
      text-align: left;
      overflow-x: auto;
      overflow-y: hidden;
    }
    
    /* Premium Success Card */
    .success-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.35rem 1.5rem;
      background-color: var(--success-bg);
      border: 1.5px solid var(--success-border);
      border-radius: 1.25rem;
      box-shadow: 0 4px 15px -3px rgba(16, 185, 129, 0.08);
      position: relative;
      overflow: hidden;
    }
    
    .success-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 5px;
      background: var(--success-gradient);
    }
    
    .success-icon-box {
      flex-shrink: 0;
      padding: 0.65rem;
      background: var(--success-gradient);
      color: white;
      border-radius: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);
    }
    
    .success-icon-box svg {
      width: 1.35rem;
      height: 1.35rem;
    }
    
    .success-content {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }
    
    .success-label {
      font-size: 10px;
      font-weight: 800;
      color: var(--success-text);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.85;
    }
    
    .success-value {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--success-text);
      letter-spacing: -0.03em;
      margin: 0;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      font-size: 10px;
      color: var(--text-muted);
      padding-top: 1.5rem;
      border-top: 1px solid var(--border-color);
    }
  </style>

  <div class="container">
    <!-- Header Area -->
    <div class="header-area">
      <div class="badge-container">
        <span class="badge">$module</span>
      </div>
      <h1 class="title">$chapter</h1>
    </div>

    <!-- Question Card -->
    <div class="card math-grid">
      <div class="card-accent-top"></div>
      <div class="label-muted">$labelQuestion</div>
      <div class="content-bold">$question</div>
    </div>

    <!-- Steps / Solution Section -->
    <div class="card">
      <div class="label-muted">$labelSteps</div>
      <div id="solution-text" class="content-normal">$solution</div>
    </div>

    <!-- Final Answer Card -->
    <div class="success-card">
      <div class="success-icon-box">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      </div>
      <div class="success-content">
        <div class="success-label">$labelResult</div>
        <div class="success-value">$answer</div>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      $labelCopyright
    </div>
  </div>
  ''';
}
