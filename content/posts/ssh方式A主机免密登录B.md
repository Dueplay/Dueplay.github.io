---
title: 配置ssh免密登录
date: 2021-09-03T20:30:08+08:00
# weight: 1
# aliases: ["/first"]
tags: ["linux"]
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

ssh方式A主机免密登录B

1.首先在A主机上执行命令

```shell
ssh-keygen -t rsa
```

会在执行命令的当前用户的家目录下的.ssh中生成公钥和私钥，id_rsa和id_rsa.pub分别存放私钥和公钥。

2.将公钥加入到B主机的~/.ssh/authorized_keys文件中

scp方式or手动复制粘贴。

```shell
scp ~/.ssh/id_rsa.pub root@B主机ip:~/
```

B主机上执行：

```shell
cat ~/id_rsa.pub>>~/.ssh/authorized_keys
```

3.如果不能登录检查以下注意的点和检查/etc/ssh/sshd_config，确保以下配置打开。

```sh
RSAAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile      .ssh/authorized_keys
```

需要注意的几点：
1、确保A机器私钥文件名是id_rsa，否则会因为识别不到私钥文件而不会执行免密rsa登录；

2、确保B机器上.ssh/authorized_keys文件的属性是600，否则要使用命令、

```sh
chmod 600 ~/.ssh/authorized_keys
```

更改属性。
3、authorized_keys存放的目录需要与登录用户对应，比如使用root用户登录，则是在/home/root/.ssh/authorized_keys


