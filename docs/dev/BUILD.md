# 构建说明

克隆仓库:

```bash
git clone git@github.com:VaillerTeeter/marktext-maintained.git
```

## 1. 前提条件

在开始开发之前，你需要设置你的构建环境：

- Node.js = `v22`，并且需要 yarn
- Python >=v3.6 用于 node-gyp
- C 编译器和开发工具
- 构建支持 Linux、macOS 和 Windows

## 2. Ubuntu 24.04:

```bash
# 进入代码目录
cd marktext-maintained
# 更新 apt 软件包索引，确保后续安装拿到最新版本
sudo apt-get -y update
# 安装 MarkText 打包/编译需要的系统级依赖
sudo apt-get install -y icnsutils graphicsmagick xz-utils libx11-dev libxkbfile-dev gnome-keyring libsecret-1-dev libfontconfig-dev rpm
# 安装 Node 依赖
yarn install --check-files --frozen-lockfile
# 运行 ESLint，检查代码风格与潜在语法错误
yarn run lint
# 运行自定义许可证扫描脚本，确保所有依赖的 LICENSE 与项目声明兼容
yarn run validate-licenses
# 执行完整单元测试(UNIT) + 集成测试(E2E)，失败即退出
# 本地环境
ELECTRON_DISABLE_SANDBOX=1 yarn run test
# ssh 的远程环境
ELECTRON_DISABLE_SANDBOX=1 xvfb-run -a yarn run test
# 生成 Linux 通用发行包（AppImage、tar.gz、deb、rpm）（当前只有 deb），英文版
yarn run release:linux
# 在 Linux 构建基础上再打一套「简体中文」语言包的独立安装包
yarn run release:linux:zh-Hans
# 同上，生成一套「繁体中文」语言包的独立安装包
yarn run release:linux:zh-Hant
```

## 3. masOS Tahoe 26.2:

```bash
# 安装 Node 依赖
yarn install --check-files --frozen-lockfile
# 运行 ESLint，检查代码风格与潜在语法错误
yarn run lint
# 运行自定义许可证扫描脚本，确保所有依赖的 LICENSE 与项目声明兼容
yarn run validate-licenses
# 执行完整单元测试(UNIT) + 集成测试(E2E)，失败即退出
# 本地环境
yarn run test
# ssh 的远程环境
ELECTRON_DISABLE_SANDBOX=1 xvfb-run -a yarn run test
# 生成 macOS 通用发行包（dmg、pkg、zip）（当前只有 dmg），英文版
yarn run release:mac
# 在 macOS 构建基础上再打一套「简体中文」语言包的独立安装包
yarn run release:mac:zh-Hans
# 同上，生成一套「繁体中文」语言包的独立安装包
yarn run release:mac:zh-Hant
```

## 4. Windows:

```bash
# Windows 的本人未测试过，下面的步骤是从 github 工作流中搞出来的
# 全局安装最新版 node-gyp（用于编译原生 C/C++ 模块）
npm install --global node-gyp@latest
# 将 npm 的全局路径设为 node-gyp 的默认调用路径，确保后续原生模块编译时始终使用刚安装的版本
# % 为 PowerShell 管道语法，$_ 表示上一命令的输出（全局前缀路径）
npm prefix -g | % {npm config set node_gyp "$_\node_modules\node-gyp\bin\node-gyp.js"}
# 预下载当前 Node 版本的头文件与库，加快后续编译速度并离线可用
node-gyp install
# 安装 Node 依赖
yarn install --check-files --frozen-lockfile
# 运行 ESLint，检查代码风格与潜在语法错误
yarn run lint
# 运行自定义许可证扫描脚本，确保所有依赖的 LICENSE 与项目声明兼容
yarn run validate-licenses
# 执行完整单元测试(UNIT) + 集成测试(E2E)，失败即退出
# 本地环境
yarn run test
# ssh 的远程环境
ELECTRON_DISABLE_SANDBOX=1 xvfb-run -a yarn run test
# 生成 Windows 通用发行包（nsis、msi、portable zip）（当前只有 nisi），英文版
yarn run release:win
# 在 Windows 构建基础上再打一套「简体中文」语言包的独立安装包
yarn run release:win:zh-Hans
# 同上，生成一套「繁体中文」语言包的独立安装包
yarn run release:win:zh-Hant
```
