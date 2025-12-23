# 热修（Hotfix）发布流程

- 本篇用于在**不引入大改动**的前提下，快速修复线上问题并发布一个新版本
- 如果不是紧急修复（例如需要合并大量特性/重构），请按常规发布流程执行：见 [RELEASE.md](RELEASE.md)

## 1. 准备工作

- 确认要修复的问题与目标版本号（例如 `25.12.7`）
- 明确热修的基线：通常从「线上最新发布版本」对应的提交开始（建议从 tag 或已发布分支）
- 本地构建流程：见 [BUILD.md](BUILD.md)
- CI Release 工作流触发流程：见 [RELEASE.md](RELEASE.md)

## 2. 创建热修分支

建议使用以下分支命名（任选其一，团队统一即可）：

- 热修开发分支：`hotfix-vX.Y.Z`
- 或直接使用发布分支：`release-vX.Y.Z`（适合“热修=发布”的简化流程）

示例（从当前分支创建热修分支）：

```bash
git checkout -b hotfix-vX.Y.Z
```

如果你要从某个已发布 tag 开始（推荐）：

```bash
git checkout <tag>
git checkout -b hotfix-vX.Y.Z
```

## 3. 引入修复（直接改 / cherry-pick）

你可以直接在当前分支修改代码并提交；或从其它分支挑选提交（`cherry-pick`）

### 3.1 如何 cherry-pick

```bash
git checkout hotfix-vX.Y.Z
git cherry-pick <full-commit-hash>
```

如发生冲突：

- 手动解决冲突后：`git add -A`
- 继续 cherry-pick：`git cherry-pick --continue`
- 若需要放弃本次挑选：`git cherry-pick --abort`

建议每次只挑一个提交，便于定位冲突与回滚

## 4. 更新版本号与变更记录（必须）

热修也需要一个新的版本号

- 更新 `package.json` 的 `version`
- 更新变更记录：`.github/CHANGELOG.md`
- 更新 Linux AppStream 元数据版本（若本次发布需要同步）：`resources/linux/marktext.appdata.xml`

提交信息建议保持一致性，例如：

```bash
git commit -m "Release version X.Y.Z"
```

说明：本仓库的构建环境会把 `package.json` 的版本注入到应用版本字符串中；Release CI 会设置 `MARKTEXT_IS_STABLE=1`，使稳定版不带 Git hash 后缀

## 5. 本地验证（建议至少跑一轮）

最低要求：Lint + License + Unit + E2E

```bash
yarn install --check-files --frozen-lockfile
yarn run lint
yarn run validate-licenses
yarn run test
```

如需在 Linux 远程/无 GUI 环境跑 Unit + E2E（参考 [BUILD.md](BUILD.md)）：

```bash
ELECTRON_DISABLE_SANDBOX=1 xvfb-run -a yarn run test
```

如需本地验证安装包构建（按需选择平台与语言包）：

```bash
# 英文包
yarn run release:linux
# 简中/繁中语言包
yarn run release:linux:zh-Hans
yarn run release:linux:zh-Hant
```

## 6. 触发 CI Release 并发布

当热修分支验证完成后，建议将“发布相关内容”整理在一个清晰的提交里（版本号 + changelog + 必要修复）

然后创建发布分支并推送（用于触发 Release 工作流）：

```bash
git checkout -b release-vX.Y.Z
git commit -m "Release version X.Y.Z"
git push
```

或者在现有分支上打 `release-vX.Y.Z` tag 触发（取决于团队习惯）：

```bash
git tag -a release-vX.Y.Z -m "Release version X.Y.Z"
git push origin tag v25.12.5
```

CI 会执行：安装依赖 → Lint/License → 测试 → electron-builder 打包并 `--publish always`，请确保仓库 Secrets 已配置可用于发布（工作流里使用 `secrets.PERSONAL_TOKEN` 作为 `GITHUB_TOKEN`）

发布完成后，再按 [RELEASE.md](RELEASE.md) 补齐“发布说明/校验和/网站与文档/Flathub”等后续事项（若本次热修涉及）

## 7. 发布后检查清单

- 下载并安装至少一个平台的产物，验证热修问题确实被修复
- 核对应用版本号显示是否为 `vX.Y.Z`
- 如涉及 Linux 桌面集成/依赖变更，确认 `deb` 安装依赖正常（见 `electron-builder.yml` 的 `deb.depends`）
