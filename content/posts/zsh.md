---
title: "zsh安装与配置"
date: 2023-01-26T20:03:48+08:00
# weight: 1
# aliases: ["/first"]
tags: ["Linux"]
author: "Me"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: "Desc Text."
canonicalURL: "https://canonical.url/to/page"
disableHLJS: true # to disable highlightjs
disableShare: true
disableHLJS: false
hideSummary: false
searchHidden: false
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
cover:
    image: "<image path/url>" # image path/url
    alt: "<alt text>" # alt text
    caption: "<text>" # display caption under cover
    relative: false # when using page bundles set this to true
    hidden: true # only hide on current single page
editPost:
    URL: "https://github.com/Dueplay/blog/content"
    Text: "Suggest Changes" # edit text
    appendFilePath: true # to append file path to Edit link
---


### 安装

ubuntu系统默认的shell是bash，可以使用`echo $SHELL`命令来查看当前使用的`shell`，zsh是bash的一个替代品，它的功能更加强大和丰富，可以使用`cat /etc/shells`来查看支持的shell

如果结果中没有zsh的话就需要使用下面的命令来安装一下：

```shell
sudo apt install zsh -y
```

### 安装字体

这里安装powerlevel10k主题推荐使用的MesloLGS-Nerd字体。

一般在初次安装配置主题的时候会默认提示安装，但是如果没有正常安装的话也可以使用下面的内容来手动安装一下：
MesloLGS字体ttf文件下载地址：

```shell
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Regular.ttf &&
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold.ttf  &&
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Italic.ttf  &&
wget https://github.com/romkatv/powerlevel10k-media/raw/master/MesloLGS%20NF%20Bold%20Italic.ttf
```

安装完成之后在系统设置或者各个软件比如终端或者VSCode上把字体设置为`MesloLGS NF`就可以了。

```bash
# 将下载的字体拷贝至truetype
sudo cp ttf/*.ttf /usr/share/fonts/truetype/
# 安装fontconfig
sudo apt install fontconfig
# 刷新字体缓存
fc-cache -fv
```

### 安装Oh-My-Zsh

```shell
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

慢或者失败的小伙伴可以换成国内源:

```shell
wget https://gitee.com/mirrors/oh-my-zsh/raw/master/tools/install.sh
```

下载之后给`install.sh`添加执行权限：

```shell
chmod +x install.sh
```

然后还需要修改一下安装脚本中的远程仓库地址：

打开install.sh文件，找到以下部分：

```shell
# Default settings
ZSH=${ZSH:-~/.oh-my-zsh}
REPO=${REPO:-ohmyzsh/ohmyzsh}
REMOTE=${REMOTE:-https://github.com/${REPO}.git}
BRANCH=${BRANCH:-master}
```

将中间两行修改为下面这样，使用gitee镜像：

```shell
REPO=${REPO:-mirrors/ohmyzsh}
REMOTE=${REMOTE:-https://gitee.com/${REPO}.git}
```

然后保存退出，再执行一下，一般就应该安装好了。

将系统默认`shell`切换为`zsh`

```shell
# 切换默认shell
chsh -s $(which zsh)
# 确认是否切换成功
echo $SHELL
```

### 安装Zsh主题和插件

```shell
# powerlevel10k主题
git clone https://github.com/romkatv/powerlevel10k.git $ZSH_CUSTOM/themes/powerlevel10k
# zsh-autosuggestions自动提示插件
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# zsh-syntax-highlighting语法高亮插件
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 配置powerlevel10k，选择各种样式
p10k configure
```

在`~/.zshrc`文件启用插件和主题

```shell
# 修改主题
ZSH_THEME="powerlevel10k/powerlevel10k"

# 启用插件
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

[参考文档]([Linux终端环境配置 | GeekHour](https://www.geekhour.net/2023/10/21/linux-terminal/))

