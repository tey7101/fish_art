// Social Media Configuration
// Update these values with your actual social media links

const SOCIAL_CONFIG = {
  // Site information
  site: {
    name: "AI Fish Drawing",
    url: window.location.origin, // Will be auto-detected
    description: "Draw a fish with AI validation and watch it swim!"
  },

  // X (formerly Twitter) configuration
  x: {
    handle: "ZING__AI", // Your X handle (without @)
    url: "https://x.com/ZING__AI", // Your X URL
    displayText: "Follow on X",
    followerCount: "10K+" // Optional: Update this manually or remove
  },
  
  // Legacy Twitter reference for compatibility
  twitter: {
    handle: "ZING__AI",
    url: "https://x.com/ZING__AI",
    displayText: "Follow on X",
    followerCount: "10K+"
  },

  // Discord configuration
  discord: {
    inviteUrl: "https://discord.gg/4VJA3Xw2",
    displayText: "Join Discord Community",
    memberCount: "2K+" // Optional: Update this manually or remove
  },

  // Share functionality configuration
  share: {
    // Default share text for different platforms
    defaultText: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
    hashtags: ["drawafish", "AI", "CreativeTools", "BuildInPublic"],
    
    // Platform-specific share messages
    // 统一使用X的分享文案以保持品牌一致性
    messages: {
      x: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
      twitter: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!", // Legacy
      facebook: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
      linkedin: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
      reddit: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
      instagram: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!"
    }
  },

  // Call-to-action texts
  cta: {
    followX: "Follow for more AI tools", // X (formerly Twitter)
    joinDiscord: "Join our community",
    shareYourFish: "Share your fish",
    viewMyProjects: "View my other projects"
  },

  // Other projects (optional - can be empty array)
  otherProjects: [
    // TODO: Add your other projects here
    // Example:
    // {
    //   name: "AI Chat Assistant",
    //   url: "https://your-project.com",
    //   description: "Chat with AI"
    // }
  ]
};

// Make config globally available
window.SOCIAL_CONFIG = SOCIAL_CONFIG;

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SOCIAL_CONFIG;
}

