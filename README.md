<p align="center"><img src="static/logo-small.png" alt="MarkText" width="100" height="100"></p>

<h1 align="center">MarkText</h1>

<div align="center">
  <strong>&#x1F506; 下一代 Markdown 编辑器 &#x1F319;</strong><br>
  一个简单优雅的开源 Markdown 编辑器，专注于速度和可用性<br>
  <sub>可用于 Linux、macOS 和 Windows</sub>
</div>

<br>

<div align="center">
  <!-- Version -->
  <a href="https://github.com/VaillerTeeter/marktext-maintained/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/VaillerTeeter/marktext-maintained">
  </a>
  <!-- License -->
  <a href="LICENSE">
    <img alt="GitHub License" src="https://img.shields.io/github/license/VaillerTeeter/marktext-maintained">
  </a>
  <!-- Build Status -->
  <a href="https://github.com/VaillerTeeter/marktext-maintained/actions/workflows/build.yml">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/VaillerTeeter/marktext-maintained/build.yml?label=dev-build">
  </a>
  <a href="https://github.com/VaillerTeeter/marktext-maintained/actions/workflows/release.yml">
    <img alt="GitHub Actions Workflow Status" src="https://img.shields.io/github/actions/workflow/status/VaillerTeeter/marktext-maintained/release.yml?label=release-build">
  </a>
  <!-- Downloads total -->
  <a href="https://github.com/VaillerTeeter/marktext-maintained/releases">
    <img alt="GitHub Downloads (all assets, all releases)" src="https://img.shields.io/github/downloads/VaillerTeeter/marktext-maintained/total?label=downloads-all">
  </a>
  <!-- Downloads latest release -->
  <a href="https://github.com/VaillerTeeter/marktext-maintained/releases/latest">
    <img alt="GitHub Downloads (all assets, latest release)" src="https://img.shields.io/github/downloads-pre/VaillerTeeter/marktext-maintained/latest/total">
  </a>
  <!-- sponsors -->
  <a href="#%E8%B5%9E%E5%8A%A9">
    <img alt="Sponsor" src="https://img.shields.io/badge/%E8%B5%9E%E5%8A%A9-%E6%94%AF%E6%8C%81%E9%A1%B9%E7%9B%AE-brightgreen">
  </a>
</div>

<div align="center">
  <h3>
    <a href="https://github.com/VaillerTeeter/marktext-maintained">
      网站
    </a>
    <span> | </span>
    <a href="https://github.com/VaillerTeeter/marktext-maintained?tab=readme-ov-file#%E7%89%B9%E6%80%A7">
      特性
    </a>
    <span> | </span>
    <a href="https://github.com/VaillerTeeter/marktext-maintained?tab=readme-ov-file#%E4%B8%8B%E8%BD%BD%E5%92%8C%E5%AE%89%E8%A3%85">
      下载
    </a>
    <span> | </span>
    <a href="https://github.com/VaillerTeeter/marktext-maintained?tab=readme-ov-file#%E5%BC%80%E5%8F%91">
      开发
    </a>
    <span> | </span>
    <a href="https://github.com/VaillerTeeter/marktext-maintained?tab=readme-ov-file#%E8%B5%9E%E5%8A%A9">
      赞助
    </a>
    <span> | </span>
    <a href="https://github.com/VaillerTeeter/marktext-maintained?tab=readme-ov-file#%E8%B4%A1%E7%8C%AE">
      贡献
    </a>
  </h3>
</div>

<div align="center">
  <sub>这款 Markdown 编辑器由
    <a href="https://github.com/Jocs">Jocs</a>
    和
    <a href="https://github.com/VaillerTeeter/marktext-maintained/graphs/contributors">贡献者们</a>
    以 ❤︎ 打造<br/>
    由
    <a href="https://github.com/VaillerTeeter">Vailler</a>
    完成自 2022 年后
    <a href="https://github.com/marktext/marktext">marktext</a>
    基本停滞后的依赖升级工作，并合入了
    <a href="https://github.com/chinayangxiaowei/marktext-chinese-language-pack">chinayangxiaowei</a>
    的多语言方案
    </sub>
</div>

<br />

## 截图

![](docs/assets/marktext.png?raw=true)

### 特性

- 实时预览（所见即所得）和简洁明了的界面，使您获得无干扰的写作体验
- 支持 [CommonMark 规范](https://spec.commonmark.org/0.29/) 和 [GitHub Flavored Markdown 规范](https://github.github.com/gfm/)
- Markdown扩展，例如数学表达式（KaTeX）、front matter 和 emoji
- 支持段落和内联样式快捷方式，以提高您的写作效率
- 输出 **HTML** 和 **PDF** 文件
- 各种主题：**Cadmium Light**、**Material Dark** 等等
- 各种编辑模式：**源代码模式**、**打字机模式**、**专注模式**
- 直接从剪贴板中粘贴图片

<h4 align="center">&#x1F319; 主题 &#x1F506;</h4>

| Cadmium Light                                     | Dark                                            |
|:-------------------------------------------------:|:-----------------------------------------------:|
| ![](docs/themeImages/cadmium-light.png?raw=true)  | ![](docs/themeImages/dark.png?raw=true)         |
| Graphite Light                                    | Material Dark                                   |
| ![](docs/themeImages/graphite-light.png?raw=true) | ![](docs/themeImages/materal-dark.png?raw=true) |
| Ulysses Light                                     | One Dark                                        |
| ![](docs/themeImages/ulysses-light.png?raw=true)  | ![](docs/themeImages/one-dark.png?raw=true)     |

<h4 align="center">&#x1F638; 编辑模式 &#x1F436;</h4>

| 源代码                  | 打字机                      | 专注                  |
|:--------------------:|:------------------------:|:-------------------:|
| ![](docs/assets/source.gif) | ![](docs/typewriter.gif) | ![](docs/assets/focus.gif) |

## 为什么要编写一个编辑器？

1. 我爱写作，我曾经使用过很多 Markdown 编辑器，但还没有一个编辑器可以完全满足我的需求，我不喜欢当我写一些难以忍受的错误时会被打扰，**MarkText** 使用 virtual DOM 来渲染页面，具有高效和开源的附加优势，这样，任何喜欢 Markdown 和写作的人都可以使用 MarkText
2. 如上所述，**MarkText** 是完全自由开源的，并且将永远是开源的，我们希望所有 Markdown 爱好者都可以贡献自己的代码，并帮助将 **MarkText** 开发为流行的 Markdown 编辑器
3. Markdown 编辑器很多，各有优点，有一些拥有独特的特性，我们很难满足每个 Markdown 用户的需求，但是我们希望 **MarkText** 能够尽可能满足每个 Markdown 用户的需求，尽管最新的 **MarkText** 仍不完美，但我们将尽力使它尽可能地完善
4. **MarkText** 的主线已经基本停滞，各种依赖库早已更新到更高的版本，我希望它的功能能够维持在最新
5. 作为一个 Chinese，使用英文版本的编辑器，总会有这样或那样的不便，因此将此编译器更改为多语言的版本，不同的语言有不同的安装包

## 下载和安装

- 请访问项目的 [Release 页面](https://github.com/VaillerTeeter/marktext-maintained/releases)
- [Release 页面](https://github.com/VaillerTeeter/marktext-maintained/releases)中目前有 Ubuntu、MacOS、Windows 的简体中文、繁体中文、英文的版本
- 想要看看最新版本有什么新特性？请参阅[更新日志](.github/CHANGELOG.md)

#### macOS

您可以从 [Release 页面](https://github.com/VaillerTeeter/marktext-maintained/releases)下载最新的版本 `marktext-arm64-%language%.dmg`

#### Windows

您可以从 [Release 页面](https://github.com/VaillerTeeter/marktext-maintained/releases)下载最新的版本 `marktext-setup-%language%.exe`

#### Linux

您可以从 [Release 页面](https://github.com/VaillerTeeter/marktext-maintained/releases)下载最新的版本 `marktext-amd64-%language%.deb`

## 开发

如果您想自己构建 **MarkText**，请查看我们的[构建指南](docs/dev/BUILD.md).

- [用户文档](docs/user/README.md)
- [开发者文档](docs/dev/README.md)

如果您对 **MarkText** 有任何疑问，欢迎写一个 issue，当这样做时，请使用打开 issue 时的默认格式，当然，如果您直接提交 PR，我们将不胜感激

## 赞助

如果这个项目对你有帮助，欢迎通过 China 平台赞助支持维护

<div align="center">
  <table>
    <tr>
      <th>微信</th>
      <th>支付宝</th>
    </tr>
    <tr>
      <td>
        <img src="docs/sponsor/wechat-pay.svg" alt="微信赞赏码" width="240" />
      </td>
      <td>
        <img src="docs/sponsor/alipay.svg" alt="支付宝收款码" width="240" />
      </td>
    </tr>
  </table>
</div>

<!-- 维护者说明：如何替换为真实二维码见 [docs/sponsor/README.md](docs/sponsor/README.md) -->

## 集成

- [github 工作流](https://github.com/VaillerTeeter/marktext-maintained/actions)
- 提交在 main, master, develop 分支上的会触发普通的 build
- 提交在 release-v* 分支上的或存在 release-v* 的 tag 会触发 release 编译，并生成所有的版本，创建 release 草稿

## 贡献

- MarkText 正在全面开发中，请确保在提出 PR 之前先阅读[贡献指南](CONTRIBUTING.md)
- 想要给 MarkText 添加一些功能？请先看看开放的 [issue](https://github.com/VaillerTeeter/marktext-maintained/issues) 以及主分支开放的  [issue](https://github.com/marktext/marktext/issues)

## 贡献者

感谢所有为 MarkText 做出贡献的人[[贡献者](https://github.com/VaillerTeeter/marktext-maintained/graphs/contributors)]

特别感谢设计了 MarkText 图标的 @[Yasujizr](https://github.com/Yasujizr)

<a href="https://github.com/VaillerTeeter/marktext-maintained/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=VaillerTeeter/marktext-maintained" />
</a>
