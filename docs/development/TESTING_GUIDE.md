# FishArt.Online 测试指南

本文档提供全面的测试指南，用于验证 ONNX 模型加载优化和网站性能。

---

## 📋 测试清单

### ✅ 功能测试

- [ ] ONNX 模型加载成功
- [ ] 进度条正常显示和更新
- [ ] 网络速度自适应提示正确
- [ ] Service Worker 正常缓存模型
- [ ] 迷你鱼缸预览正常加载
- [ ] 画鱼功能正常工作
- [ ] AI 验证功能正常

### ✅ 性能测试

- [ ] Lighthouse Performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 200ms
- [ ] Cumulative Layout Shift < 0.1

### ✅ 网络测试

- [ ] Fast 3G 网络下可用
- [ ] Slow 3G 网络下可用
- [ ] 离线模式（Service Worker）

### ✅ 兼容性测试

- [ ] Chrome/Edge (最新版)
- [ ] Firefox (最新版)
- [ ] Safari (最新版)
- [ ] 移动端 Chrome
- [ ] 移动端 Safari

---

## 🔧 测试工具设置

### 1. Chrome DevTools 网络节流

**设置步骤：**
1. 打开 Chrome DevTools (F12)
2. 切换到 **Network** 标签
3. 点击 **Throttling** 下拉菜单
4. 选择预设网络速度：
   - **Fast 3G**: 下载 1.6 Mbps, 上传 0.75 Mbps
   - **Slow 3G**: 下载 400 Kbps, 上传 400 Kbps
   - **Offline**: 测试 Service Worker 缓存

**测试命令：**
```javascript
// 在 Console 中运行，检查模型加载时间
performance.mark('model-start');
// 等待模型加载完成
performance.mark('model-end');
performance.measure('model-load', 'model-start', 'model-end');
console.log(performance.getEntriesByName('model-load'));
```

### 2. Lighthouse 性能测试

**在线测试：**
```bash
# 使用 Chrome DevTools
1. 打开 DevTools (F12)
2. 切换到 Lighthouse 标签
3. 选择 "Performance" 类别
4. 选择 "Mobile" 设备
5. 点击 "Generate report"
```

**CLI 测试：**
```bash
# 安装 Lighthouse
npm install -g lighthouse

# 运行测试
lighthouse https://fishart.online --output html --output-path ./lighthouse-report.html

# 使用移动端配置
lighthouse https://fishart.online --preset=mobile --output json --output-path ./mobile-report.json
```

### 3. WebPageTest

访问 [https://www.webpagetest.org/](https://www.webpagetest.org/)

**配置：**
- **Test Location**: 选择目标用户地理位置
- **Browser**: Chrome
- **Connection**: 3G, 4G, Cable
- **Number of Tests**: 3 (取平均值)

---

## 📊 性能基准目标

### Core Web Vitals

| 指标 | 优秀 | 需要改进 | 差 |
|------|------|----------|-----|
| **LCP** (Largest Contentful Paint) | < 2.5s | 2.5s - 4.0s | > 4.0s |
| **FID** (First Input Delay) | < 100ms | 100ms - 300ms | > 300ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | 0.1 - 0.25 | > 0.25 |

### 加载时间目标

| 网络条件 | 模型加载时间 | 首屏时间 |
|---------|-------------|----------|
| **Fast WiFi (50 Mbps)** | < 10s | < 1s |
| **4G (10 Mbps)** | < 40s | < 2s |
| **3G (1 Mbps)** | < 2min | < 3s |

### Service Worker 缓存

- **首次访问**: 完整下载 43MB
- **第二次访问**: 0 字节（从缓存读取）
- **缓存命中率**: 100%

---

## 🧪 测试场景

### 场景 1：首次访问（无缓存）

**目标：** 验证进度条和加载提示

**步骤：**
1. 清空浏览器缓存和 Service Worker
   ```javascript
   // 在 Console 中运行
   caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
   navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(reg => reg.unregister()));
   ```
2. 刷新页面 (Ctrl+Shift+R)
3. 观察模型加载 UI：
   - ✅ 显示"AI模型加载中..."
   - ✅ 进度条从 0% 增长到 100%
   - ✅ 根据网络速度显示不同提示
   - ✅ "Make it Swim" 按钮禁用
4. 模型加载完成后：
   - ✅ 显示"✅ AI模型加载完成！"
   - ✅ 2秒后自动隐藏加载提示
   - ✅ "Make it Swim" 按钮启用

**验证点：**
```javascript
// 检查 Service Worker 是否注册
navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('Service Worker registered:', regs.length > 0);
});

// 检查模型是否缓存
caches.open('fishart-model-cache-v1').then(cache => {
    cache.match('/fish_doodle_classifier.onnx').then(response => {
        console.log('Model cached:', !!response);
    });
});
```

### 场景 2：第二次访问（有缓存）

**目标：** 验证 Service Worker 缓存生效

**步骤：**
1. 正常刷新页面 (F5)
2. 观察：
   - ✅ 模型加载几乎瞬间完成
   - ✅ 进度条快速到达 100%
   - ✅ Network 面板显示 "(from ServiceWorker)"
3. 检查加载时间：
   ```javascript
   performance.getEntriesByName('/fish_doodle_classifier.onnx')[0].duration
   // 应该 < 100ms
   ```

### 场景 3：慢速网络 (Slow 3G)

**目标：** 验证网络自适应提示

**步骤：**
1. 在 DevTools 中设置网络为 "Slow 3G"
2. 清空缓存并刷新
3. 观察：
   - ✅ 显示"⚠️ 网络较慢，预计需要5-10分钟"
   - ✅ 进度条缓慢增长但持续更新
   - ✅ 用户体验友好，不会以为卡死

### 场景 4：离线模式

**目标：** 验证离线可用性

**步骤：**
1. 正常访问页面一次（触发缓存）
2. 在 DevTools 中设置网络为 "Offline"
3. 刷新页面
4. 验证：
   - ✅ 页面可以加载
   - ✅ 模型从 Service Worker 缓存读取
   - ✅ 画鱼功能正常工作
   - ❌ 提交功能失败（预期行为）

### 场景 5：迷你鱼缸预览

**目标：** 验证懒加载和性能

**步骤：**
1. 访问首页
2. 观察迷你鱼缸预览区域：
   - ✅ 初始不加载（display: none）
   - ✅ 滚动到视口附近时才开始加载
   - ✅ 显示加载动画
3. 加载完成后：
   - ✅ 显示最近 8 条鱼
   - ✅ 图片正常显示
   - ✅ 点击跳转到鱼缸页面

**性能验证：**
```javascript
// 检查是否使用了 Intersection Observer
console.log('IntersectionObserver supported:', 'IntersectionObserver' in window);

// 检查网络请求
performance.getEntriesByType('resource').filter(e => e.name.includes('firebase'))
// 应该只在进入视口后才有请求
```

---

## 🐛 常见问题排查

### 问题 1：模型加载失败

**症状：** 显示"❌ 模型加载失败"

**排查步骤：**
1. 检查模型文件是否存在：
   ```bash
   curl -I https://fishart.online/fish_doodle_classifier.onnx
   ```
2. 检查 Console 错误信息
3. 验证 ONNX Runtime 是否加载：
   ```javascript
   console.log('ONNX Runtime loaded:', !!window.ort);
   ```

**解决方案：**
- 确保 `fish_doodle_classifier.onnx` 在项目根目录
- 检查 CDN 或服务器配置
- 验证 CORS 头设置正确

### 问题 2：进度条不更新

**症状：** 进度条卡在某个百分比

**排查步骤：**
1. 检查 Content-Length 头：
   ```javascript
   fetch('/fish_doodle_classifier.onnx').then(r => {
       console.log('Content-Length:', r.headers.get('content-length'));
   });
   ```
2. 检查 ReadableStream 是否支持：
   ```javascript
   console.log('ReadableStream supported:', !!ReadableStream);
   ```

**解决方案：**
- 确保服务器返回 Content-Length 头
- 降级到不确定进度的加载动画

### 问题 3：Service Worker 未注册

**症状：** 第二次访问仍然下载完整模型

**排查步骤：**
1. 检查 Service Worker 注册状态：
   ```javascript
   navigator.serviceWorker.getRegistrations().then(regs => {
       console.log('Registrations:', regs);
   });
   ```
2. 检查 sw.js 是否可访问：
   ```bash
   curl https://fishart.online/sw.js
   ```
3. 检查浏览器是否支持：
   ```javascript
   console.log('Service Worker supported:', 'serviceWorker' in navigator);
   ```

**解决方案：**
- 确保使用 HTTPS（Service Worker 要求）
- 检查 sw.js 文件路径正确
- 清除旧的 Service Worker 重新注册

### 问题 4：迷你鱼缸不显示

**症状：** 首页没有鱼缸预览区域

**排查步骤：**
1. 检查元素是否存在：
   ```javascript
   console.log('Preview section:', !!document.getElementById('mini-tank-preview'));
   ```
2. 检查 Intersection Observer：
   ```javascript
   console.log('[Mini Tank Preview] logs in Console');
   ```
3. 检查 Firebase 请求：
   ```javascript
   performance.getEntriesByType('resource').filter(e => e.name.includes('firebase'));
   ```

**解决方案：**
- 滚动页面触发懒加载
- 检查 Firebase 配置和 API 密钥
- 验证网络连接

---

## 📈 性能优化建议

### 已实施优化

✅ **ONNX 模型预加载** - 使用 `<link rel="preload">`  
✅ **HTTP 缓存** - 模型文件缓存 1 年  
✅ **Service Worker** - 永久缓存模型到浏览器  
✅ **进度跟踪** - 实时显示下载进度  
✅ **网络自适应** - 根据网络速度显示提示  
✅ **懒加载** - 迷你鱼缸使用 Intersection Observer

### 未来优化方向

🔄 **模型量化** - INT8 量化减小 75% 大小 → 10-12 MB  
🔄 **CDN 加速** - 使用 Cloudflare/AWS CloudFront  
🔄 **代码分割** - 按需加载非关键 JavaScript  
🔄 **图片优化** - 使用 WebP 格式，懒加载图片  
🔄 **CSS 优化** - 提取关键 CSS，延迟加载非关键样式

---

## 📝 测试报告模板

### 测试信息

- **测试日期**: YYYY-MM-DD
- **测试环境**: Chrome 版本 / Firefox 版本
- **测试人员**: 姓名
- **网站版本**: Git commit hash

### 功能测试结果

| 功能 | 状态 | 备注 |
|------|------|------|
| 模型加载 | ✅ / ❌ | |
| 进度条显示 | ✅ / ❌ | |
| Service Worker | ✅ / ❌ | |
| 迷你鱼缸 | ✅ / ❌ | |

### 性能测试结果

| 指标 | 目标 | 实际 | 状态 |
|------|------|------|------|
| Lighthouse Score | > 90 | XX | ✅ / ❌ |
| LCP | < 2.5s | X.Xs | ✅ / ❌ |
| FID | < 100ms | XXms | ✅ / ❌ |
| CLS | < 0.1 | 0.XX | ✅ / ❌ |
| 模型加载 (WiFi) | < 10s | XXs | ✅ / ❌ |
| 模型加载 (4G) | < 40s | XXs | ✅ / ❌ |

### 问题和建议

1. 问题描述...
2. 优化建议...

---

## 🔗 有用的链接

- [Chrome DevTools Network Throttling](https://developer.chrome.com/docs/devtools/network/#throttle)
- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)

---

**最后更新：** 2024-10-31  
**维护者：** FishArt.Online 开发团队

