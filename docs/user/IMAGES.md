# 图片支持

MarkText 支持从本地文件插入图片，也支持从剪贴板粘贴图片，并可按你的偏好设置在插入后自动执行不同的处理动作

在偏好设置中进入 **Image**，你可以设置“插入图片后的默认动作”（对“从本地文件插入”和“从剪贴板粘贴”都生效）

注意：剪贴板图片处理在 macOS 与 Windows 上支持更完整；在 Linux 上可能存在限制

## 使用所选上传器上传到云端

将默认动作设为 `upload` 时，MarkText 会尝试用你配置的上传器把图片上传到图床/云端，并将返回的 URL 写入文档

- 具体配置与支持的上传器类型，请参见 [IMAGE_UPLOADER_CONFIGRATION.md](IMAGE_UPLOADER_CONFIGRATION.md)
- 如果上传失败，MarkText 会弹出警告提示，并回退为“复制到本地图片目录”（保存到全局图片目录，并在文档中插入本地路径）

## 复制到指定本地目录（全局目录 / 相对 assets 目录）

将默认动作设为 `folder` 时：

- 对于从本地插入的图片：会复制到你设置的 **Global image folder**（全局图片目录）。为了避免重名冲突，实际保存的文件名可能会被重命名
- 对于从剪贴板粘贴的图片：会先保存到全局图片目录

### 优先使用相对 assets 目录（Prefer relative assets folder）

启用 **Prefer relative assets folder** 后，且当前文档已经保存到磁盘时，MarkText 会把图片移动到“相对目录”并在文档中插入相对路径

相对目录由 **Relative image folder name** 决定：

- 该值必须是相对路径（不能以 `/`、`\\` 或盘符开头）。为空时会使用默认值 `assets`
- 你可以在路径中使用变量 `${filename}`。它会被替换为“当前文档文件名（不含扩展名）”
- 当你打开了一个项目（文件夹）且 **Relative image folder name** 中不包含 `${filename}` 时，图片会优先相对“项目根目录”保存；否则会相对“当前文档所在目录”保存
- 如果当前文档尚未保存到磁盘（例如新建未保存文件），相对目录规则不会生效，图片会保存在全局图片目录中

相对目录示例：

- `assets`
- `../assets`
- `.`（当前文档目录）
- `assets/123`
- `assets_${filename}`（将文档名拼到目录名里）
- `assets/${filename}`（为每个文档单独建立子目录）

提示：请确保目录名是有效路径名，并且 MarkText 对该目录有写入权限

## 保持原始位置（Keep original location）

将默认动作设为 `path` 时：

- 对于从本地插入的图片：MarkText 会直接使用原始路径，不会复制文件
- 对于从剪贴板粘贴的图片：由于没有“原始文件路径”，MarkText 仍会将图片保存到全局图片目录；如果当前文档已保存到磁盘且启用了“Prefer relative assets folder”，则会进一步移动到相对目录并插入相对路径
