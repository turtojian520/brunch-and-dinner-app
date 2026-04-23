# 🚀 快速修复 iOS 模拟器 - 3 个方法

## 问题
iOS 模拟器显示错误: `Operation timed out (code=60)`

---

## ✅ 方法 1: 自动设置脚本 (最简单)

我已为您创建了自动设置脚本!

### 运行设置脚本

```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
./setup-ios.sh
```

这个脚本会:
- ✅ 检查所有必需的工具
- ✅ 自动安装 Homebrew (如需要)
- ✅ 自动安装 CocoaPods
- ✅ 构建并运行 iOS 应用

**如果脚本没有执行权限,运行:**
```bash
chmod +x setup-ios.sh
./setup-ios.sh
```

---

## ✅ 方法 2: 手动安装依赖 (推荐,如脚本失败)

### 第 1 步: 安装 Homebrew

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

按照提示完成安装。

### 第 2 步: 安装 CocoaPods

```bash
brew install cocoapods
```

### 第 3 步: 验证安装

```bash
pod --version
```

应该显示版本号 (如: 1.15.2)

### 第 4 步: 构建并运行 iOS 应用

```bash
cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
npx expo run:ios
```

首次构建需要 3-5 分钟,请耐心等待。

---

## ✅ 方法 3: 使用 Expo Go (备选方案)

如果以上方法都不行,可以使用 Expo Go:

### 选项 A: 在物理 iPhone 上测试

1. **在 iPhone 上安装 Expo Go**
   - 打开 App Store
   - 搜索 "Expo Go"
   - 安装

2. **启动开发服务器**
   ```bash
   cd "/Users/qinhao/Documents/python/VS_code_python/projects/op.2_brunch&dinner/whatoeat"
   npx expo start
   ```

3. **扫描二维码**
   - 打开 Expo Go 应用
   - 点击 "Scan QR Code"
   - 扫描终端中显示的二维码

### 选项 B: 在模拟器中安装 Expo Go

1. **启动 iOS 模拟器**
   ```bash
   open -a Simulator
   ```

2. **在模拟器中打开 Safari**
   - 访问: https://expo.dev/go
   - 下载并安装 Expo Go

3. **启动 Expo**
   ```bash
   npx expo start
   ```

4. **在终端按 `i`** 打开 iOS 模拟器

---

## 🎯 推荐路径

**如果您有时间 (10-15 分钟):**
→ 使用 **方法 1** (自动脚本) 或 **方法 2** (手动安装)

**如果您想快速测试 (5 分钟):**
→ 使用 **方法 3 选项 A** (物理 iPhone)

**如果没有物理设备:**
→ 先在 **Android** 上测试,然后再设置 iOS

---

## 📱 Android 已经可以运行!

在设置 iOS 的同时,您可以在 Android 上测试应用:

```bash
npm run android
```

或

```bash
npx expo start
# 然后按 'a'
```

---

## 🔍 验证一切正常

成功后,您应该看到:

```
✓ Building the app...
✓ Installing the app on "iPhone 17 Pro"
✓ Opening exp://192.168.3.47:8081 on iPhone 17 Pro
```

然后 WhatToEat 应用会在模拟器中自动打开!

---

## ❓ 常见问题

### Q: Homebrew 安装卡住了
**A:** 可能需要几分钟,耐心等待。或者按 `Ctrl+C` 取消,然后重试。

### Q: CocoaPods 安装失败
**A:** 尝试:
```bash
sudo gem install cocoapods
```

### Q: Xcode 许可协议
**A:** 如果提示需要接受许可:
```bash
sudo xcodebuild -license accept
```

### Q: "No profiles for ... were found"
**A:** 在 Xcode 中:
1. 打开项目: `open ios/whatoeat.xcworkspace`
2. 选择 Target → Signing
3. 勾选 "Automatically manage signing"
4. 选择您的 Apple ID 作为 Team

### Q: 构建太慢
**A:** 首次构建慢是正常的。后续构建会快很多 (~30秒)。

---

## 📞 获取帮助

如果遇到问题:

1. **查看详细文档**
   - 阅读 `IOS_SETUP.md`
   - 查看 `BACKEND_INTEGRATION.md`

2. **检查日志**
   ```bash
   npx expo start --verbose
   ```

3. **清理缓存**
   ```bash
   npx expo start --clear
   rm -rf node_modules
   npm install
   ```

4. **重置模拟器**
   ```bash
   xcrun simctl erase all
   ```

---

## 🎊 成功标志

当一切正常时,您会看到:

1. ✅ 模拟器自动启动
2. ✅ WhatToEat 应用图标出现
3. ✅ 应用自动打开
4. ✅ 显示启动画面和食物表情
5. ✅ 可以点击 "Generate Random Menu"

---

## 💪 坚持!

iOS 设置第一次可能有点复杂,但一旦设置好,后续开发会非常流畅!

**目前的状态:**
- ✅ Android 构建: 已完成,可运行
- ✅ Supabase 后端: 已集成
- ✅ 所有功能: 已实现
- ⏳ iOS 构建: 正在设置中

**您几乎完成了!** 🎉

---

更新时间: 2026-01-26
