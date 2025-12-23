# MarkText（本仓库）发布流程

本文档面向 `marktext-maintained` 仓库的发布流程（GitHub Actions + electron-builder）
本仓库的 Release 工作流触发条件是：推送到 `release-v*` 分支或推送 `release-v*` tag（见 `.github/workflows/release.yml`）

构建环境与本地打包命令请参考：[BUILD.md](BUILD.md)

## 1. 创建发布分支（Release Candidate）

1) 选定要发布的版本号（示例：`25.12.7`）

2) 从主分支切出发布分支：

```bash
git checkout main
git pull
git checkout -b release-vX.Y.Z
```

说明：Release CI 会设置 `MARKTEXT_IS_STABLE=1`，用于标识稳定发布（影响应用版本字符串是否追加 Git hash），本地打包一般不需要手动设置；如需本地产出“稳定版标识”的包，可临时设置该环境变量

## 2. 更新版本号与变更记录（必须）

1) 更新版本号：
- `package.json` 的 `version`
2) 更新变更记录：
- `.github/CHANGELOG.md`
3) 更新 Linux AppStream 元数据版本（若本次发布需要同步）：
- `resources/linux/marktext.appdata.xml`
4) 提交发布相关更改（建议把“版本号 + changelog + appdata”放在同一个提交里）：

```bash
git add -A
git commit -m "release version X.Y.Z"
```

## 3. 本地验证（强烈建议）

最低要求：Lint + License + Unit + E2E

```bash
yarn install --check-files --frozen-lockfile
yarn run lint
yarn run validate-licenses
yarn run test
```

如需本地验证打包（按需选择平台与语言包）：

```bash
# 英文包
yarn run release:linux
# 简中/繁中语言包
yarn run release:linux:zh-Hans
yarn run release:linux:zh-Hant
```

## 4. 触发 CI Release 构建与发布

创建发布分支并推送（用于触发 Release 工作流）：

```bash
git checkout -b release-vX.Y.Z
git commit -m "Release version X.Y.Z"
git push
```

工作流会执行：安装依赖 → Lint/License → 测试 → 打包（electron-builder）并 `--publish always` 上传产物
注意：工作流使用 `secrets.PERSONAL_TOKEN` 作为 `GITHUB_TOKEN`，请确保仓库 Secrets 已正确配置，否则发布会失败

### （可选）创建 tag

本仓库的 Release 工作流还可监听的是 `release-v*` tag
如果你希望用 tag 来标识发布点，可以创建并推送同名 tag（可能会触发第二次构建）：

```bash
git tag -a release-vX.Y.Z -m "Release version X.Y.Z"
git push origin tag v25.12.5
```

如果你仍然想维护传统的 `vX.Y.Z` tag（仅用于阅读/生态习惯），可以另行创建；但它**不会**触发本仓库 Release 工作流

## 5. 发布内容校验

- 在 GitHub Release / Actions 中确认三套语言包（`en`/`zh-Hans`/`zh-Hant`）的产物齐全
- 校验 SHA256（CI 在 Linux/macOS/Windows 均会计算并输出，并给自动复制到 Release 说明里）
- 至少在一个平台下载并安装产物，确认版本号显示为 `vX.Y.Z` 且关键功能正常

## 6. 发布后工作

- 检查 `.github/CHANGELOG.md` 中关联的 issue/PR 是否需要关闭
