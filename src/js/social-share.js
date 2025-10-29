// Social Share Functionality
// Lightweight module for social media sharing without external dependencies

class SocialShare {
  constructor(config) {
    this.config = config || window.SOCIAL_CONFIG;
    this.siteUrl = this.config.site.url;
  }

  /**
   * Check if native Web Share API is supported (mobile devices)
   */
  isNativeShareSupported() {
    return navigator.share !== undefined;
  }

  /**
   * Native share using Web Share API (best for mobile)
   */
  async shareNative(customText, customUrl) {
    if (!this.isNativeShareSupported()) {
      return false;
    }

    try {
      await navigator.share({
        title: this.config.site.name,
        text: customText || this.config.share.defaultText,
        url: customUrl || this.siteUrl
      });
      return true;
    } catch (err) {
      // User cancelled or share failed
      console.log('Native share cancelled or failed:', err);
      return false;
    }
  }

  /**
   * Share to X (formerly Twitter)
   */
  shareToX(customText, customUrl) {
    const text = customText || this.config.share.messages.x;
    const url = customUrl || this.siteUrl;
    const hashtags = this.config.share.hashtags.join(',');
    
    const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags}`;
    
    this.openPopup(shareUrl, 'X Share', 550, 420);
  }
  
  // Legacy method for backward compatibility
  shareToTwitter(customText, customUrl) {
    return this.shareToX(customText, customUrl);
  }

  /**
   * Share to Facebook
   */
  shareToFacebook(customUrl) {
    const url = customUrl || this.siteUrl;
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    
    this.openPopup(shareUrl, 'Facebook Share', 550, 420);
  }

  /**
   * Share to LinkedIn
   */
  shareToLinkedIn(customUrl) {
    const url = customUrl || this.siteUrl;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    
    this.openPopup(shareUrl, 'LinkedIn Share', 550, 420);
  }

  /**
   * Share to Reddit
   */
  shareToReddit(customTitle, customUrl) {
    const title = customTitle || this.config.share.messages.reddit;
    const url = customUrl || this.siteUrl;
    const shareUrl = `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`;
    
    this.openPopup(shareUrl, 'Reddit Share', 550, 500);
  }

  /**
   * Copy link to clipboard
   */
  async copyLink(customUrl) {
    const url = customUrl || this.siteUrl;
    
    try {
      // Modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      }
      
      // Fallback method for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    } catch (err) {
      console.error('Failed to copy link:', err);
      return false;
    }
  }

  /**
   * Universal share method - tries native first, falls back to specific platform
   */
  async share(platform, customText, customUrl) {
    // Try native share on mobile first
    if (this.isNativeShareSupported() && platform === 'native') {
      return await this.shareNative(customText, customUrl);
    }

    // Platform-specific sharing
    switch (platform.toLowerCase()) {
      case 'x':
      case 'twitter':
        this.shareToX(customText, customUrl);
        break;
      case 'facebook':
        this.shareToFacebook(customUrl);
        break;
      case 'linkedin':
        this.shareToLinkedIn(customUrl);
        break;
      case 'reddit':
        this.shareToReddit(customText, customUrl);
        break;
      case 'copy':
        return await this.copyLink(customUrl);
      default:
        console.error('Unknown platform:', platform);
        return false;
    }
    
    return true;
  }

  /**
   * Open popup window for social sharing
   */
  openPopup(url, title, width, height) {
    const left = (window.innerWidth - width) / 2 + window.screenX;
    const top = (window.innerHeight - height) / 2 + window.screenY;
    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;
    
    window.open(url, title, features);
  }

  /**
   * Create share button HTML
   */
  createShareButton(platform, text, className) {
    const icons = {
      x: '✖️',
      twitter: '✖️', // Legacy support
      facebook: '📘',
      linkedin: '💼',
      reddit: '🔶',
      discord: '💬',
      copy: '📋',
      native: '📤'
    };

    const button = document.createElement('button');
    button.className = `share-btn share-${platform} ${className || ''}`;
    button.innerHTML = `${icons[platform] || '📤'} ${text}`;
    button.onclick = () => this.share(platform);
    
    return button;
  }

  /**
   * Create complete share menu
   */
  createShareMenu(containerClass) {
    const container = document.createElement('div');
    container.className = `share-menu ${containerClass || ''}`;

    // Native share button for mobile
    if (this.isNativeShareSupported()) {
      container.appendChild(this.createShareButton('native', 'Share', 'btn-primary'));
    } else {
      // Desktop: show individual platform buttons
      container.appendChild(this.createShareButton('x', 'X', 'btn-x'));
      container.appendChild(this.createShareButton('facebook', 'Facebook', 'btn-facebook'));
      container.appendChild(this.createShareButton('linkedin', 'LinkedIn', 'btn-linkedin'));
      container.appendChild(this.createShareButton('reddit', 'Reddit', 'btn-reddit'));
    }

    // Copy link button (always show)
    const copyBtn = this.createShareButton('copy', 'Copy Link', 'btn-copy');
    copyBtn.onclick = async () => {
      const success = await this.copyLink();
      if (success) {
        copyBtn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          copyBtn.innerHTML = '📋 Copy Link';
        }, 2000);
      }
    };
    container.appendChild(copyBtn);

    return container;
  }
}

// Initialize global instance
window.socialShare = new SocialShare(window.SOCIAL_CONFIG);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialShare;
}

