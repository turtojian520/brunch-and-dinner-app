# iOS 模拟器问题修复总结

## 📋 问题诊断

**原始错误:**
```
Error: xcrun simctl openurl ... exited with non-zero code: 60
Simulator device failed to open exp://192.168.3.47:8081
Operation timed out
```

**根本原因:**
- iOS 模拟器无法通过 Expo Go 连接到开发服务器
- 对于 Expo SDK 52,需要使用开发构建而不是 Expo Go
- 缺少必要的依赖: CocoaPods

---

## ✅ 已完成的修复

### 1. 更新了 app.json 配置
添加了 iOS bundleIdentifier:
```json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.whatoeat.app"
}
```

### 2. 安装了 Expo 开发客户端
```bash
npx expo install expo-dev-client
```

### 3. 创建了自动设置脚本
**文件:** `setup-ios.sh`

这个脚本会自动:
- ✅ 检查 Homebrew
- ✅ 检查 CocoaPods
- ✅ 检查 Xcode
- ✅ 提供安装指引
- ✅ 自动构建和运行 iOS 应用

### 4. 创建了完整文档

| 文档 | 用途 |
|------|------|
| `FIX_IOS_NOW.md` | **快速修复指南** - 3 种方法修复 iOS |
| `IOS_SETUP.md` | **详细设置指南** - 完整的故障排除 |
| `setup-ios.sh` | **自动化脚本** - 一键设置 |
| `README.md` | **更新主文档** - 添加 iOS 说明 |

---

## 🚀 下一步操作 (选择一种方法)

### 方法 A: 使用自动设置脚本 (最简单) ⭐

```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
./setup-ios.sh
```

脚本会引导您完成所有设置步骤。

### 方法 B: 手动设置 (如果脚本失败)

#### 步骤 1: 安装 Homebrew (如未安装)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 步骤 2: 安装 CocoaPods

```bash
brew install cocoapods
```

#### 步骤 3: 验证安装

```bash
pod --version
```

应该显示版本号 (如: 1.15.2)

#### 步骤 4: 构建并运行

```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
npx expo run:ios
```

**重要:** 首次构建需要 3-5 分钟,这是正常的!

### 方法 C: 使用物理 iPhone (最快测试)

1. 在 iPhone 上从 App Store 安装 "Expo Go"
2. 运行:
   ```bash
   npx expo start
   ```
3. 用 Expo Go 扫描终端显示的二维码

---

## 🎯 期望结果

成功后,您会看到:

```
✓ Building the app...
✓ Installing the app on "iPhone 17 Pro"
✓ Launching the app...
› Opening on iPhone 17 Pro Simulator
```

然后:
1. ✅ iOS 模拟器自动启动 (如果未运行)
2. ✅ WhatToEat 应用图标出现在主屏幕
3. ✅ 应用自动打开
4. ✅ 显示启动画面 (🍳🥗🍝)
5. ✅ 可以点击 "Generate Random Menu"

---

## 📱 临时解决方案

### 在等待 iOS 设置时,可以:

**选项 1: 在 Android 上测试**
```bash
npm run android
```

Android 已经完全配置好,可以立即运行!

**选项 2: 在 Web 上测试**
```bash
npx expo start --web
```

在浏览器中测试应用 (部分功能可能受限)。

---

## 🔍 验证清单

完成设置后,验证这些功能:

### 基本功能
- [ ] 应用在 iOS 模拟器中启动
- [ ] 看到 WhatToEat 启动画面
- [ ] 可以生成随机菜单
- [ ] 导航到所有 5 个 tab

### 数据功能 (需要配置 Supabase)
- [ ] 添加新食谱
- [ ] 添加食材
- [ ] 添加到菜单日历
- [ ] 数据保存到云端

### Supabase 连接
- [ ] 创建了 `.env` 文件
- [ ] 在 Supabase 运行了 `schema.sql`
- [ ] 应用可以加载云端数据

---

## 📚 相关文档

### 必读文档

1. **iOS 快速修复**
   - 文件: `FIX_IOS_NOW.md`
   - 用途: 立即解决 iOS 问题

2. **Supabase 快速开始**
   - 文件: `QUICK_START.md`
   - 用途: 10 分钟设置后端

3. **完整后端指南**
   - 文件: `BACKEND_INTEGRATION.md`
   - 用途: 理解架构和 API

### 可选文档

4. **iOS 详细设置**
   - 文件: `IOS_SETUP.md`
   - 用途: 深入故障排除

5. **项目总结**
   - 文件: `IMPLEMENTATION_SUMMARY.md`
   - 用途: 了解已实现的功能

---

## ⚙️ 系统要求

确保您的 Mac 满足这些要求:

### 必需
- ✅ macOS (iOS 开发仅支持 macOS)
- ✅ Xcode (从 App Store 免费下载)
- ✅ Node.js 18+ (`node --version`)
- ✅ Homebrew (包管理器)

### 推荐
- ✅ CocoaPods (通过 Homebrew 安装)
- ✅ Watchman (提升性能)
- ✅ 至少 15GB 可用磁盘空间 (Xcode 很大)

---

## 🐛 常见错误及解决

### 错误 1: "CocoaPods not found"

**解决:**
```bash
brew install cocoapods
```

### 错误 2: "xcodebuild not found"

**解决:**
1. 从 App Store 安装 Xcode
2. 运行:
   ```bash
   xcode-select --install
   ```

### 错误 3: "Build failed with exit code 65"

**解决:**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

### 错误 4: "Port 8081 already in use"

**解决:**
```bash
lsof -ti:8081 | xargs kill -9
npx expo start --clear
```

### 错误 5: "Unable to boot device"

**解决:**
```bash
xcrun simctl shutdown all
xcrun simctl erase all
npx expo run:ios
```

---

## 💬 获取帮助

如果遇到其他问题:

1. **查看日志**
   ```bash
   npx expo start --verbose
   ```

2. **清理缓存**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

3. **检查 Expo 文档**
   - [Expo iOS Setup](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Troubleshooting](https://docs.expo.dev/troubleshooting/overview/)

4. **检查所有文档**
   - 项目中有 10+ 个文档文件
   - 每个文件都有详细的说明和示例

---

## 📈 开发进度

### 已完成 ✅
- ✅ React Native 应用架构
- ✅ 5 个主要页面 (Home, Calendar, Ingredients, Recipes, Bot)
- ✅ Supabase 后端集成
- ✅ Android 构建和部署
- ✅ 数据库架构设计
- ✅ 服务层实现
- ✅ 离线支持
- ✅ 完整文档

### 进行中 ⏳
- ⏳ iOS 开发环境设置
- ⏳ iOS 模拟器配置

### 未来计划 📋
- 📋 用户认证 (Supabase Auth)
- 📋 真实 AI 集成
- 📋 照片上传
- 📋 实时同步

---

## 🎉 恭喜!

您已经非常接近成功了!

**当前状态:**
- ✅ 应用代码: 100% 完成
- ✅ Android: 可运行
- ✅ 后端: 已集成
- ⏳ iOS: 设置中 (按照本文档操作即可)

**下一步:**
1. 运行 `./setup-ios.sh` 或按照方法 B 手动设置
2. 等待首次构建完成 (3-5 分钟)
3. 在 iOS 模拟器中测试应用
4. 设置 Supabase 后端 (参考 QUICK_START.md)
5. 享受您的 WhatToEat 应用!

---

## 🌟 提示

- **首次构建慢是正常的** - 后续会快很多
- **遇到错误不要慌** - 查看本文档的"常见错误"部分
- **Android 已经可用** - 可以先在 Android 上测试
- **文档很全面** - 几乎所有问题都有解答

**您做得很好!继续加油!** 💪

---

更新时间: 2026-01-26
状态: iOS 设置指南已完成
