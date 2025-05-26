/**
 * Blog Configuration
 *
 * This file provides backward compatibility for existing imports
 * The actual configuration system is now in config/index.js
 */

// Re-export everything from the new config system
export * from './config/index.js'

// Import the proxy for backward compatibility
import { blogConfig as config } from './config/index.js'

// Export as both named and default for maximum compatibility
export { config as blogConfig }
export default config