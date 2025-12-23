# 图片上传器配置（图床）

当你在偏好设置中把“插入图片后的默认动作”设为“上传到云端”时，MarkText 会使用你选择的图片上传器（图床）把图片上传，并把返回的 URL 插入到文档中

入口：打开偏好设置（`CmdOrCtrl + ,`）→ `Image` → 将 *Default action after an image is inserted...* 设为 **Upload image to cloud using selected uploader**

## 支持的上传器（以当前项目实现为准）

- **PicGo（picgo CLI）**：调用本机 `picgo` 命令上传
- **GitHub**：通过 GitHub API 把图片提交到指定仓库
- **命令行脚本（Command line script）**：执行你提供的脚本，由脚本输出图片 URL

说明：如果图片超过 5MB，上传会被拒绝，MarkText 会回退为“复制到本地图片目录”的方式，并给出提示

## PicGo

PicGo 是一个用于上传图片到多种图床的工具。MarkText 会在上传时调用：

```sh
picgo u "<图片路径>"
```

因此你需要：

1. 安装 PicGo-Core（确保命令 `picgo` 在你的 `PATH` 中可用）
2. 按 PicGo 的文档完成图床配置（例如 GitHub/七牛/SM.MS 等）

更多信息：

- https://picgo.github.io/PicGo-Doc/en/guide/

## GitHub

在偏好设置里选择 `GitHub` 上传器后，需要填写以下配置：

1. 创建一个用于存放图片的 GitHub 仓库：https://github.com/new
2. 创建一个访问令牌（Token）：https://github.com/settings/tokens
3. 在 MarkText 的 `Image` → `Uploader` 中：
	- 选择 **GitHub**
	- 填写 `token`、`owner`、`repo`（`branch` 可选）
	- 勾选法律声明（Terms/Privacy）确认框（未勾选将无法保存）
	- 点击 **Save** 保存配置

提示：Token 会被安全存储（macOS Keychain / Linux Secret Service / Windows Credential Vault）

注意：当前 UI 会提示 GitHub 上传器将来可能会被移除，推荐优先使用 PicGo

## 命令行脚本（Command line script）

如果你选择 `Command line script`：

- 需要填写一个**可执行脚本的绝对路径**
- MarkText 会以“图片文件路径”作为脚本的唯一参数执行它
- 你的脚本需要把最终图片地址输出到标准输出（stdout），该输出会被当作图片的 `src` 使用（可以是 URL、data URI 等任意合法值）

这适合对接自建图床或公司内部上传服务
