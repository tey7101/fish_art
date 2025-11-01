# 社交分享文案统一更新

## 更新日期
2025年11月1日

## 更新目标
将X (Twitter) 的分享文案同步到所有其他社交平台，确保品牌信息在所有渠道保持一致。

## 统一的分享文案
```
🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!
```

## 更新内容

### 1. 配置文件更新 (`src/js/social-config.js`)

**更新前：**
- X: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!"
- Facebook: "Check out this cool AI fish drawing tool - your doodle comes to life!"
- LinkedIn: "Interesting AI project: Draw a fish and watch it swim with 50K+ fish from artists worldwide."
- Reddit: "My doodle fish comes alive with AI! Join 50K+ artists in this amazing fish tank 🐠"
- Instagram: 未配置

**更新后：**
所有平台均使用统一文案：
```javascript
messages: {
  x: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
  twitter: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!", // Legacy
  facebook: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
  linkedin: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
  reddit: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!",
  instagram: "🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!"
}
```

### 2. 分享功能增强 (`src/js/social-share.js`)

#### Facebook 分享
- ✅ 添加了文案参数支持
- ✅ 使用配置文件中的统一文案
- ✅ 尝试通过 `quote` 参数传递文案（虽然Facebook的sharer支持有限）

```javascript
shareToFacebook(customUrl, customText) {
  const text = customText || this.config.share.messages.facebook;
  const shareUrl = `...&quote=${encodeURIComponent(text)}`;
}
```

#### Instagram 分享
- ✅ 添加了文案参数支持
- ✅ 在提示信息中显示建议的文案
- ✅ 使用配置文件中的统一文案

```javascript
shareToInstagram(customUrl, customText) {
  const text = customText || this.config.share.messages.instagram;
  alert(`Link copied! Suggested caption:\n\n${text}\n\nYou can now paste it in your Instagram post or story.`);
}
```

#### LinkedIn 分享（新增）
- ✅ 新增 LinkedIn 分享功能
- ✅ 使用配置文件中的统一文案
- ✅ 集成到统一的分享接口中

```javascript
shareToLinkedIn(customText, customUrl) {
  const url = customUrl || this.siteUrl;
  const text = customText || this.config.share.messages.linkedin;
  const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  this.openPopup(shareUrl, 'LinkedIn Share', 550, 500);
}
```

### 3. Tank页面分享函数更新 (`src/js/tank.js`)

**更新前：**
- 使用硬编码的分享文案
- Facebook 参数顺序错误

**更新后：**
```javascript
// 所有函数都移除了硬编码文案，改用配置文件
function shareOnTwitter(imageUrl) {
    if (window.socialShare) {
        window.socialShare.shareToX(null, window.location.href);
    }
}

function shareOnFacebook(imageUrl) {
    if (window.socialShare) {
        window.socialShare.shareToFacebook(window.location.href, null);
    }
}

function shareOnReddit(imageUrl) {
    if (window.socialShare) {
        window.socialShare.shareToReddit(null, window.location.href);
    }
}
```

## 技术说明

### 各平台分享机制

| 平台 | 文案传递方式 | 说明 |
|------|------------|------|
| **X (Twitter)** | URL参数 | ✅ 完全支持预填文案 |
| **Facebook** | URL参数 (`quote`) | ⚠️ 部分支持，主要依赖 OpenGraph 标签 |
| **LinkedIn** | OpenGraph 标签 | ⚠️ 主要依赖页面的 meta 标签 |
| **Reddit** | URL参数 | ✅ 完全支持预填标题 |
| **Instagram** | 手动复制粘贴 | ℹ️ 无直接API，需用户手动粘贴 |

### OpenGraph 标签建议

虽然我们统一了JavaScript中的分享文案，但各HTML页面的 OpenGraph meta 标签也应该保持一致：

```html
<meta property="og:description" content="🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!">
<meta name="twitter:description" content="🐠 My doodle fish comes alive with AI and swims with 50K+ funny fish from artists worldwide!">
```

## 优势

1. **品牌一致性** - 所有社交平台使用相同的核心信息
2. **维护简化** - 只需在一个地方更新文案
3. **扩展性** - 新增平台时自动继承统一文案
4. **灵活性** - 仍然支持自定义文案的能力

## 测试建议

建议在以下场景测试分享功能：
- ✅ 从主页分享
- ✅ 从鱼缸页面分享
- ✅ 从排行榜分享
- ✅ 移动端和桌面端
- ✅ 不同浏览器（Chrome, Safari, Firefox）

## 后续工作

- [ ] 可选：更新所有HTML页面的 meta 标签，确保与配置文案一致
- [ ] 可选：添加分享统计功能，追踪各平台的分享效果
- [ ] 可选：考虑添加更多社交平台（如微信、微博等）

## 相关文件

- `src/js/social-config.js` - 社交媒体配置
- `src/js/social-share.js` - 社交分享功能实现
- `src/js/tank.js` - 鱼缸页面分享函数
- `docs/SOCIAL_SHARE_IMAGE_SOLUTION.md` - 社交分享图片解决方案

---

**维护者注意：** 今后如需更新分享文案，只需修改 `src/js/social-config.js` 中的 `share.messages` 配置即可。

