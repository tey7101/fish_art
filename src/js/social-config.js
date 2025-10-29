// Social Media Configuration
// Update these values with your actual social media links

const SOCIAL_CONFIG = {
  // Site information
  site: {
    name: "AI Fish Drawing",
    url: window.location.origin, // Will be auto-detected
    description: "Draw a fish with AI validation and watch it swim!"
  },

  // Twitter configuration
  twitter: {
    handle: "YourTwitterHandle", // TODO: Replace with your Twitter handle (without @)
    url: "https://twitter.com/YourTwitterHandle", // TODO: Replace with your Twitter URL
    displayText: "Follow on Twitter",
    followerCount: "10K+" // Optional: Update this manually or remove
  },

  // Discord configuration
  discord: {
    inviteUrl: "https://discord.gg/placeholder", // TODO: Replace with your Discord invite link
    displayText: "Join Discord Community",
    memberCount: "2K+" // Optional: Update this manually or remove
  },

  // Share functionality configuration
  share: {
    // Default share text for different platforms
    defaultText: "I just created an AI fish and it's swimming! 🐟 Check out this amazing tool:",
    hashtags: ["AI", "CreativeTools", "BuildInPublic"],
    
    // Platform-specific share messages
    messages: {
      twitter: "I just drew a fish with AI and it came to life! 🐟 Try it yourself:",
      facebook: "Check out this cool AI fish drawing tool I found!",
      linkedin: "Interesting AI project: Draw a fish and watch it swim with real-time AI validation.",
      reddit: "Found this awesome AI fish drawing tool - your fish actually swims!"
    }
  },

  // Call-to-action texts
  cta: {
    followTwitter: "Follow for more AI tools",
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

