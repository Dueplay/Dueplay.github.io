---
title: "Docker的使用"
date: 2022-12-03T11:32:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["devops"]
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

### 配置 Docker 使用 WSL 2

安装和设置 WSL 2 后，你需要确保 Docker Desktop 配置为使用 WSL 2。这可以通过 Docker Desktop 的设置进行：

1. 打开 Docker Desktop。
2. 进入 Settings（设置）> General（常规）。
3. 确认 “Use the WSL 2 based engine”（使用基于 WSL 2 的引擎）选项已经被选中。

## docker使用

### 1. 管理镜像

- **拉取镜像**：

  ```bash
  docker pull [options] <image>:<tag>
  ```

  例如：`docker pull ubuntu:20.04`

- **列出镜像**：

  ```bash
  docker images
  ```

- **构建镜像**：

  ```bash
  docker build -t <image_name>:<tag> .
  ```

  例如：`docker build -t myapp:latest .`

  latest为默认tag，.表示目录

- **删除镜像**：

  ```bash
  docker rmi <image>
  ```

  例如：`docker rmi myapp:latest`

### 2. 管理容器

- **运行容器**：

  ```bash
  docker run [options] <image>:<tag>
  ```

  例如：`docker run -d --name webserver -p 80:80 nginx`

  参数解释：

  `-d` 选项代表 "detached mode"，也就是让 Docker 容器在后台运行。这意味着命令行将不会被阻塞在容器日志输出上，用户可以继续在同一个命令行窗口中执行其他命令。如果不使用 `-d`，容器的标准输出将会显示在当前终端上，且终端会一直被占用直到容器停止。

  `--name` 选项用来给你的容器指定一个名称，在这个例子中容器的名称被指定为 `webserver`。这个名称可以用于 Docker 的各种命令来引用容器，比如启动、停止、删除容器等操作。如果不指定 `--name`，Docker 会自动生成一个随机的名称。

  `--privileged` 选项给予容器额外的权限，让容器几乎拥有宿主机相同级别的权限。这通常用于容器内需要执行一些特权操作的场景，如直接访问硬件设备、加载内核模块等。使用这个选项时需要谨慎，因为它降低了容器和宿主机之间的隔离度，增加了安全风险。

  `-v` 或 `--volume` 选项可以挂载卷，这是一种将宿主机的目录或数据卷连接到容器中的方式。这使得你可以保持数据的持久性和数据共享，同时也可以用于在容器与宿主机之间传递配置文件或其他数据。

  `-v [host_path]:[container_path]:[options]`

  - **[host_path]**: 宿主机上的文件系统路径，可以是绝对路径也可以是相对路径。如果该路径不存在，Docker 会自动为你创建这个目录（在使用 Docker Desktop for Windows 或 Docker Desktop for Mac 时，你可能需要额外配置共享目录权限）。
  - **[container_path]**: 容器内的挂载点，必须是绝对路径。
  - **[options]**: 可选，用于设置挂载方式，如 `ro` (只读)，`rw` (读写，默认)。

- **查看运行中的容器**：

  ```bash
  docker ps
  ```

  用 `docker ps -a` 查看所有容器（包括未运行的）。

- **停止容器**：

  ```bash
  docker stop <container_id_or_name>
  ```

  例如：`docker stop webserver`

- **启动容器**：

  ```bash
  docker start <container_id_or_name>
  ```

- **删除容器**：

  ```bash
  docker rm <container_id_or_name>
  ```

  使用 `-f` 选项来强制删除运行中的容器：`docker rm -f <container_id_or_name>`

- **查看容器日志**：

  ```bash
  docker logs <container_id_or_name>
  ```

- **进入运行中的容器**：

  ```bash
  docker exec -it <container_id_or_name> bash
  ```

  （对于不包含 bash 的容器，可能需要使用 `sh`）

### 3. 网络管理

- **列出网络**：

  ```bash
  docker network ls
  ```

- **创建网络**：

  ```bash
  docker network create <network_name>
  ```

- **连接容器到网络**：

  ```bash
  docker network connect <network_name> <container_id_or_name>
  ```

- **断开容器与网络的连接**：

  ```bash
  docker network disconnect <network_name> <container_id_or_name>
  ```

### 4. 数据卷和持久化数据

- **创建卷**：

  ```bash
  docker volume create <volume_name>
  ```

- **挂载卷到容器**： 使用 `docker run` 命令时，添加 `-v` 参数：

  ```bash
  docker run -d -v <volume_name>:<container_path> <image>
  ```

- **查看所有卷**：

  ```bash
  docker volume ls
  ```

- **删除卷**：

  ```bash
  docker volume rm <volume_name>
  ```

每个命令都可能带有许多选项，可以通过查看 Docker 文档或运行 `docker command --help` 来获取更详细的信息。

### 例子

1.Dockerfile

```dockerfile
# 每个 Dockerfile 都必须从一个已有的镜像开始。
FROM ubuntu:20.04 

# label标签是用来添加元数据的，比如作者、邮箱等信息。
LABEL maintainer="name@example.com"

# RUN 指令用于执行命令行命令。
RUN apt-get update && apt-get install -y nginx

# CMD 指令提供了容器的默认执行命令。Dockerfile 中只能有一个 CMD 指令，如果列出多个，则只有最后一个生效。
CMD ["nginx", "-g", "daemon off;"] # 或者不要[],CMD nginx -g daemin off

# EXPOSE 指令用于指定容器在运行时监听的端口。
EXPOSE 80
# 设置环境变量。
ENV NGINX_VERSION 1.14

# ADD 和 COPY 都是用来从构建环境复制文件到镜像中。COPY 是纯粹的复制，而 ADD 提供了更多功能（例如，自动解压缩压缩文件）。
# COPY src dst
COPY ./index.html /var/www/html/
ADD archive.tar /usr/src/app/

# VOLUME创建一个可以从本地主机或其他容器挂载的挂载点。
VOLUME /var/log/nginx

# 设置工作目录
WORKDIR /usr/share/nginx/html

# 设置用户
USER nginx
```

2.构建image

```shell
# 构建
docker build -t hello-docker .
# 查看有哪些镜像
docker images
docker image ls
```

3.运行image

```shell
# 运行
docker run --name xxx image_name
# 进入容器
docker exec -it 容器id或name bash
# 查看运行的容器
docker ps
# 停止容器
docker stop xxx
# 删除容器
docker rm xxx
# 启动容器
docker start xxx
```

