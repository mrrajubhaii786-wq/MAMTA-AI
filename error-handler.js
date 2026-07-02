// MAMTA AI - Production Error Handler & Toast System
// Version: 4.0.0 - TASK 2: Production Error Recovery

class ProductionErrorHandler {
    constructor() {
        this.toastContainer = null;
        this.isOnline = navigator.onLine;
        this.retryQueue = [];
        this.init();
    }

    init() {
        this.createToastContainer();
        this.setupGlobalHandlers();
        this.setupNetworkListeners();
        console.log('✅ MAMTA AI: Production Error Handler initialized');
    }

    // Create toast container
    createToastContainer() {
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        this.toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
            pointer-events: none;
        `;
        document.body.appendChild(this.toastContainer);
    }

    // Setup global error handlers
    setupGlobalHandlers() {
        // Unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('❌ Unhandled Promise Rejection:', event.reason);
            this.showToast('Something went wrong. Please try again.', 'error');
            event.preventDefault();
        });

        // Global errors
        window.addEventListener('error', (event) => {
            console.error('❌ Global Error:', event.error);
            this.showToast('An unexpected error occurred.', 'error');
            event.preventDefault();
        });

        // Override console.error to show toasts for critical errors
        const originalError = console.error;
        console.error = (...args) => {
            originalError.apply(console, args);
            const errorMsg = args.join(' ');
            if (errorMsg.includes('MAMTA AI') && errorMsg.includes('❌')) {
                this.showToast(this.getUserFriendlyError(errorMsg), 'error');
            }
        };
    }

    // Network status listeners
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showToast('🌐 Back online!', 'success');
            this.processRetryQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showToast('⚠️ You are offline. Some features may not work.', 'warning');
        });
    }

    // Show toast notification
    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #059669)',
            error: 'linear-gradient(135deg, #ef4444, #dc2626)',
            warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
            info: 'linear-gradient(135deg, #667eea, #764ba2)'
        };
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 8px 25px rgba(0,0,0,0.3);
            animation: slideInRight 0.3s ease;
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 280px;
        `;
        toast.innerHTML = `${icons[type]} ${message}`;

        this.toastContainer.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    // Retry logic for failed operations
    async retry(operation, maxRetries = 3, delay = 1000) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await operation();
            } catch (error) {
                console.warn(`⚠️ Retry ${i + 1}/${maxRetries} failed:`, error.message);
                if (i === maxRetries - 1) throw error;
                await this.sleep(delay * (i + 1));
            }
        }
    }

    // Add to retry queue
    addToRetryQueue(operation, context) {
        this.retryQueue.push({ operation, context });
        console.log('📦 Added to retry queue:', context);
    }

    // Process retry queue when back online
    async processRetryQueue() {
        if (this.retryQueue.length === 0) return;

        console.log('🔄 Processing retry queue:', this.retryQueue.length, 'items');
        const queue = [...this.retryQueue];
        this.retryQueue = [];

        for (const item of queue) {
            try {
                await item.operation();
                console.log('✅ Retry successful:', item.context);
            } catch (error) {
                console.error('❌ Retry failed:', item.context, error.message);
                this.showToast(`Failed to sync: ${item.context}`, 'error');
            }
        }
    }

    // Get user-friendly error message
    getUserFriendlyError(errorMsg) {
        if (errorMsg.includes('auth')) return 'Authentication failed. Please sign in again.';
        if (errorMsg.includes('database') || errorMsg.includes('DB')) return 'Database connection failed. Using local storage.';
        if (errorMsg.includes('network') || errorMsg.includes('fetch')) return 'Network error. Please check your connection.';
        if (errorMsg.includes('AI')) return 'AI service temporarily unavailable. Using fallback.';
        return 'Something went wrong. Please try again.';
    }

    // Check if online
    checkOnline() {
        return this.isOnline;
    }

    // Sleep helper
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CSS animations for toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyles);

// Create global instance
window.errorHandler = new ProductionErrorHandler();

console.log('📦 MAMTA AI: error-handler.js loaded');
