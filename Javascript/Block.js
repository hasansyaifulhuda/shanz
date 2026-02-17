/* =====================================================
   CODE BLOCK FUNCTIONALITY
   ===================================================== */

const Block = {
    // Initialize code blocks
    init() {
        this.setupPrism();
        this.bindEvents();
    },
    
    // Setup Prism.js
    setupPrism() {
        // Configure Prism autoloader
        if (Prism.plugins.autoloader) {
            Prism.plugins.autoloader.languages_path = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/';
        }
    },
    
    // Bind events
    bindEvents() {
        // Double-click to select all code
        document.addEventListener('dblclick', (e) => {
            if (e.target.closest('.code-container code')) {
                this.selectAllCode(e.target.closest('code'));
            }
        });
    },
    
    // Highlight code element
    highlight(element) {
        if (element && Prism) {
            Prism.highlightElement(element);
        }
    },
    
    // Highlight all code blocks
    highlightAll() {
        if (Prism) {
            Prism.highlightAll();
        }
    },
    
    // Detect language from code content
    detectLanguage(code) {
        if (!code) return 'javascript';
        
        const trimmedCode = code.trim();
        
        // HTML detection
        if (trimmedCode.match(/^<!DOCTYPE|^<html|^<head|^<body|<\/[a-z]+>/i)) {
            return 'html';
        }
        
        // CSS detection
        if (trimmedCode.match(/^[.#@][a-z]/i) || trimmedCode.match(/{\s*[a-z-]+\s*:/i)) {
            if (trimmedCode.match(/:\s*[^;]+;/)) {
                return 'css';
            }
        }
        
        // JavaScript detection
        if (trimmedCode.match(/^(const|let|var|function|class|import|export|async|await)/)) {
            return 'javascript';
        }
        
        // Python detection
        if (trimmedCode.match(/^(def |class |import |from |print\(|if __name__)/)) {
            return 'python';
        }
        
        // PHP detection
        if (trimmedCode.match(/^<\?php|\$[a-z_]/i)) {
            return 'php';
        }
        
        // SQL detection
        if (trimmedCode.match(/^(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i)) {
            return 'sql';
        }
        
        // JSON detection
        if (trimmedCode.match(/^[\[{]/) && trimmedCode.match(/[\]}]$/)) {
            try {
                JSON.parse(trimmedCode);
                return 'json';
            } catch (e) {
                // Not valid JSON
            }
        }
        
        // Default to JavaScript
        return 'javascript';
    },
    
    // Create code block HTML
    createCodeBlock(code, language = null) {
        const detectedLanguage = language || this.detectLanguage(code);
        const languageLabel = this.getLanguageLabel(detectedLanguage);
        
        const container = document.createElement('div');
        container.className = 'code-container';
        container.innerHTML = `
            <div class="code-header">
                <span class="code-language">${languageLabel}</span>
                <button class="copy-btn" onclick="Block.copyCode(this)">
                    <i class="fas fa-copy"></i> Copy
                </button>
            </div>
            <pre><code class="language-${detectedLanguage}"></code></pre>
        `;
        
        const codeElement = container.querySelector('code');
        codeElement.textContent = code;
        
        // Highlight after inserting
        setTimeout(() => {
            Prism.highlightElement(codeElement);
        }, 0);
        
        return container;
    },
    
    // Get language label
    getLanguageLabel(language) {
        const labels = {
            'html': 'HTML',
            'markup': 'HTML',
            'css': 'CSS',
            'javascript': 'JavaScript',
            'js': 'JavaScript',
            'python': 'Python',
            'php': 'PHP',
            'sql': 'SQL',
            'json': 'JSON',
            'markdown': 'Markdown',
            'md': 'Markdown',
            'bash': 'Bash',
            'shell': 'Shell'
        };
        return labels[language] || language?.toUpperCase() || 'CODE';
    },
    
    // Copy code from block
    async copyCode(button) {
        const container = button.closest('.code-container');
        const codeElement = container.querySelector('code');
        
        if (!codeElement) return;
        
        const code = codeElement.textContent;
        
        try {
            await navigator.clipboard.writeText(code);
            
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i> Copied!';
            
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '<i class="fas fa-copy"></i> Copy';
            }, 2000);
            
            Layout.showToast('Code copied to clipboard!', 'success');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.fallbackCopy(code, button);
        }
    },
    
    // Fallback copy method
    fallbackCopy(text, button) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            
            if (button) {
                button.classList.add('copied');
                button.innerHTML = '<i class="fas fa-check"></i> Copied!';
                
                setTimeout(() => {
                    button.classList.remove('copied');
                    button.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            }
            
            Layout.showToast('Code copied to clipboard!', 'success');
        } catch (error) {
            Layout.showToast('Failed to copy code', 'error');
        }
        
        document.body.removeChild(textarea);
    },
    
    // Select all code in element
    selectAllCode(element) {
        const range = document.createRange();
        range.selectNodeContents(element);
        
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    },
    
    // Format code (basic formatting)
    formatCode(code, language) {
        // Basic formatting - this could be expanded
        let formatted = code;
        
        // Remove extra blank lines
        formatted = formatted.replace(/\n{3,}/g, '\n\n');
        
        // Trim whitespace
        formatted = formatted.trim();
        
        return formatted;
    },
    
    // Get line count
    getLineCount(code) {
        if (!code) return 0;
        return code.split('\n').length;
    },
    
    // Get character count
    getCharCount(code) {
        if (!code) return 0;
        return code.length;
    }
};

// Export
window.Block = Block;
