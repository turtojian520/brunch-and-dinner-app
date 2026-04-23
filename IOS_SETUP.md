# iOS 模拟器设置指南

## 问题: iOS 模拟器连接超时

### 错误信息
```
Error: xcrun simctl openurl ... exited with non-zero code: 60
Simulator device failed to open exp://192.168.3.47:8081
Operation timed out
```

### 原因
这个错误通常由以下原因引起:
1. iOS 模拟器中没有安装 Expo Go 应用
2. 对于 Expo SDK 52+, 需要使用开发构建而不是 Expo Go
3. 网络配置问题

---

## 解决方案

### 方法 1: 使用开发构建 (推荐 ✅)

这是 Expo SDK 52 的推荐方式。

**步骤:**

1. **构建并运行 iOS 应用**
   ```bash
   npx expo run:ios
   ```

   这将:
   - 自动安装 CocoaPods 依赖
   - 构建原生 iOS 应用
   - 在模拟器中安装并启动应用
   - 连接到 Metro bundler

2. **首次构建需要时间**
   - 首次构建: 2-5 分钟
   - 后续构建: 30-60 秒

3. **验证成功**
   - 应用应该在模拟器中自动打开
   - 可以看到 WhatToEat 的启动画面

### 方法 2: 预构建然后启动

如果方法 1 遇到问题,可以分步执行:

1. **预构建 iOS 项目**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **运行应用**
   ```bash
   npx expo run:ios
   ```

### 方法 3: 使用 Expo Go (备选)

如果您想使用 Expo Go:

1. **在模拟器中打开 Safari**
   - 在 iOS 模拟器中打开 Safari 浏览器

2. **访问 Expo Go 下载页面**
   - 访问: https://expo.dev/go
   - 或在 App Store 中搜索 "Expo Go"

3. **安装 Expo Go**
   - 按照指引安装

4. **重新启动 Expo**
   ```bash
   npx expo start --clear
   # 然后按 'i'
   ```

### 方法 4: 使用二维码扫描 (物理设备)

如果您有 iPhone:

1. **启动 Expo**
   ```bash
   npx expo start
   ```

2. **在 iPhone 上安装 Expo Go**
   - 从 App Store 安装 "Expo Go"

3. **扫描二维码**
   - 打开 Expo Go 应用
   - 扫描终端显示的二维码

---

## 常见问题

### Q: 构建失败,显示 CocoaPods 错误

**A: 安装/更新 CocoaPods**

```bash
# 安装 CocoaPods
sudo gem install cocoapods

# 或更新
sudo gem update cocoapods

# 安装项目依赖
cd ios
pod install
cd ..
```

### Q: Xcode 不可用

**A: 安装 Xcode**

1. 从 App Store 安装 Xcode (免费,但很大 ~15GB)
2. 安装 Xcode Command Line Tools:
   ```bash
   xcode-select --install
   ```
3. 打开 Xcode,接受许可协议

### Q: 模拟器列表为空

**A: 检查并创建模拟器**

```bash
# 查看可用模拟器
xcrun simctl list devices

# 如果没有,创建一个
xcrun simctl create "iPhone 15" "iPhone 15"

# 启动模拟器
xcrun simctl boot "iPhone 15"
```

### Q: 端口 8081 被占用

**A: 清理端口**

```bash
# 查找占用端口的进程
lsof -ti:8081

# 终止进程 (替换 PID)
kill -9 <PID>

# 或一行命令
lsof -ti:8081 | xargs kill -9
```

### Q: Metro bundler 无法连接

**A: 重启开发服务器**

```bash
# 清除缓存并重启
npx expo start --clear

# 或手动清除
rm -rf node_modules
rm -rf .expo
npm install
npx expo start --clear
```

---

## 验证清单

构建成功后,验证以下功能:

- [ ] 应用在 iOS 模拟器中启动
- [ ] 看到 WhatToEat 启动画面
- [ ] 可以点击 "Generate Random Menu"
- [ ] 看到食谱列表
- [ ] 导航到其他 tab (Recipes, Ingredients, Calendar, Bot)
- [ ] 热重载工作 (修改代码后自动刷新)

---

## 开发工作流

成功设置后,日常开发流程:

### 选项 A: 使用 `expo run:ios` (推荐)

```bash
# 每次启动
npx expo run:ios
```

- ✅ 自动构建和启动
- ✅ 包含所有原生模块
- ✅ 热重载支持
- ⚠️ 首次启动较慢

### 选项 B: 先构建,再开发

```bash
# 首次或代码更改后
npx expo run:ios

# 然后日常开发
npx expo start
# 应用已经安装,会自动连接
```

- ✅ 后续启动快
- ✅ 热重载支持
- ⚠️ 原生代码改动需重新构建

---

## 调试技巧

### 查看 Metro Bundler 日志

```bash
# 启动时显示详细日志
npx expo start --clear --verbose
```

### 查看 iOS 模拟器日志

```bash
# 实时查看系统日志
xcrun simctl spawn booted log stream --level=debug
```

### React Native 调试

在模拟器中:
1. 按 `Cmd+D` 打开开发菜单
2. 选择 "Debug" 或 "Inspect Element"

### 重置模拟器

如果遇到持续问题:

```bash
# 关闭所有模拟器
xcrun simctl shutdown all

# 删除模拟器数据
xcrun simctl erase all

# 重新启动
npx expo run:ios
```

---

## 性能优化

### 提升构建速度

1. **使用 Watchman**
   ```bash
   brew install watchman
   ```

2. **清理缓存**
   ```bash
   # 清理 Metro bundler 缓存
   npx expo start --clear

   # 清理 iOS 构建缓存
   cd ios
   xcodebuild clean
   cd ..
   ```

3. **使用更快的模拟器**
   - 选择较新的 iPhone 模型 (如 iPhone 15)
   - 减少模拟器分辨率

---

## 故障排除流程图

```
遇到 iOS 模拟器问题
    │
    ├─→ 是否安装 Xcode? ─→ 否 ─→ 安装 Xcode
    │         ↓ 是
    │
    ├─→ 是否安装 CocoaPods? ─→ 否 ─→ sudo gem install cocoapods
    │         ↓ 是
    │
    ├─→ 运行: npx expo run:ios
    │         │
    │         ├─→ 成功? ─→ 是 ─→ ✅ 完成!
    │         │
    │         └─→ 失败?
    │              │
    │              ├─→ CocoaPods 错误? ─→ cd ios && pod install
    │              ├─→ 端口占用? ─→ lsof -ti:8081 | xargs kill -9
    │              ├─→ 构建错误? ─→ npx expo prebuild --clean
    │              └─→ 其他错误? ─→ 查看下方常见错误
```

---

## 常见错误代码

| 错误代码 | 含义 | 解决方法 |
|---------|------|---------|
| 60 | 操作超时 | 使用 `npx expo run:ios` 而不是 Expo Go |
| 61 | 连接被拒绝 | 检查防火墙,重启 Metro bundler |
| 65 | 构建失败 | 清理缓存: `npx expo prebuild --clean` |
| 66 | 代码签名错误 | 在 Xcode 中配置开发团队 |

---

## 环境要求

确保以下工具已安装:

```bash
# 检查 Node.js 版本
node --version  # 应该 >= 18.0.0

# 检查 npm 版本
npm --version   # 应该 >= 9.0.0

# 检查 Xcode 是否安装
xcodebuild -version  # 应该显示版本号

# 检查 CocoaPods
pod --version   # 应该 >= 1.10.0

# 检查可用模拟器
xcrun simctl list devices | grep "iPhone"
```

---

## 成功标志

当一切正常工作时,您应该看到:

1. **终端输出**
   ```
   › Building app...
   › Launching app...
   › Opening on iPhone 15 Simulator
   › Metro waiting on exp://192.168.3.47:8081
   ```

2. **模拟器**
   - iPhone 模拟器自动启动
   - WhatToEat 应用图标出现
   - 应用自动打开
   - 显示启动画面

3. **开发体验**
   - 代码修改后自动刷新
   - 可以打开 React Native 调试工具
   - 网络请求正常工作

---

## 额外资源

- [Expo iOS 开发文档](https://docs.expo.dev/workflow/ios-simulator/)
- [React Native 调试指南](https://reactnative.dev/docs/debugging)
- [Xcode 模拟器指南](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)

---

**更新日期:** 2026-01-26
**适用于:** Expo SDK 52+, React Native 0.76+
