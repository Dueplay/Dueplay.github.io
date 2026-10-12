---
title: Docker 使用指南
date: 2023-11-22
description: Docker 容器管理和使用的完整指南，包括镜像管理、容器操作、数据卷挂载等常用命令。
categories: [DevOps]
---

## Docker 配置

### 配置 Docker 使用 WSL 2

安装和设置 WSL 2 后，你需要确保 Docker Desktop 配置为使用 WSL 2：

1. 打开 Docker Desktop
2. 进入 Settings（设置）> General（常规）
3. 确认 "Use the WSL 2 based engine"（使用基于 WSL 2 的引擎）选项已经被选中

## 管理镜像

### 拉取镜像

```bash
docker pull [options] <image>:<tag>
```

例如：`docker pull ubuntu:20.04`

### 列出镜像

```bash
docker images
```

### 构建镜像

```bash
docker build -t <image_name>:<tag> .
```

例如：`docker build -t myapp:latest .`

- `latest` 为默认 tag
- `.` 表示当前目录

### 删除镜像

```bash
docker rmi <image>
```

例如：`docker rmi myapp:latest`

## 管理容器

### 运行容器

```bash
docker run [options] <image>:<tag>
```

例如：`docker run -d --name webserver -p 80:80 nginx`

#### 常用参数说明

**`-d` (detached mode)**：让 Docker 容器在后台运行。命令行不会被阻塞在容器日志输出上，用户可以继续在同一个命令行窗口中执行其他命令。如果不使用 `-d`，容器的标准输出将会显示在当前终端上。

**`--name`**：给容器指定一个名称，在这个例子中容器的名称被指定为 `webserver`。这个名称可以用于 Docker 的各种命令来引用容器，比如启动、停止、删除容器等操作。如果不指定 `--name`，Docker 会自动生成一个随机的名称。

**`--privileged`**：给予容器额外的权限，让容器几乎拥有宿主机相同级别的权限。这通常用于容器内需要执行一些特权操作的场景，如直接访问硬件设备、加载内核模块等。使用这个选项时需要谨慎，因为它降低了容器和宿主机之间的隔离度，增加了安全风险。

**`-v` 或 `--volume`**：挂载卷，这是一种将宿主机的目录或数据卷连接到容器中的方式。这使得你可以保持数据的持久性和数据共享，同时也可以用于在容器与宿主机之间传递配置文件或其他数据。

语法：`-v [host_path]:[container_path]:[options]`

- **[host_path]**：宿主机上的文件系统路径，可以是绝对路径也可以是相对路径。如果该路径不存在，Docker 会自动创建这个目录
- **[container_path]**：容器内的挂载点，必须是绝对路径
- **[options]**：可选，用于设置挂载方式，如 `ro`（只读）、`rw`（读写，默认）

### 查看容器

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括未运行的）
docker ps -a
```

### 停止容器

```bash
docker stop <container_id_or_name>
```

例如：`docker stop webserver`

### 启动容器

```bash
docker start <container_id_or_name>
```

### 删除容器

```bash
docker rm <container_id_or_name>
```

使用 `-f` 选项来强制删除运行中的容器：

```bash
docker rm -f <container_id_or_name>
```

## 进入容器

```bash
# 进入正在运行的容器
docker exec -it <container_name> /bin/bash

# 或使用 sh
docker exec -it <container_name> /bin/sh
```

## 查看日志

```bash
# 查看容器日志
docker logs <container_name>

# 实时查看日志
docker logs -f <container_name>

# 查看最后 100 行日志
docker logs --tail 100 <container_name>
```

## 容器与宿主机之间的文件复制

```bash
# 从容器复制文件到宿主机
docker cp <container_name>:/path/in/container /path/on/host

# 从宿主机复制文件到容器
docker cp /path/on/host <container_name>:/path/in/container
```

## Docker Compose

### 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 启动指定服务
docker-compose up -d <service_name>
```

### 停止服务

```bash
# 停止所有服务
docker-compose down

# 停止但不删除容器
docker-compose stop
```

### 查看服务状态

```bash
docker-compose ps
```

### 查看服务日志

```bash
# 查看所有服务日志
docker-compose logs

# 查看指定服务日志
docker-compose logs <service_name>

# 实时查看日志
docker-compose logs -f
```

## 清理资源

```bash
# 删除所有停止的容器
docker container prune

# 删除所有未使用的镜像
docker image prune

# 删除所有未使用的卷
docker volume prune

# 删除所有未使用的网络
docker network prune

# 一次性清理所有未使用的资源
docker system prune -a
```

## 常用技巧

### 查看容器资源占用

```bash
docker stats
```

### 限制容器资源

```bash
# 限制内存
docker run -m 512m <image>

# 限制 CPU
docker run --cpus="1.5" <image>
```

### 设置容器重启策略

```bash
# 总是重启
docker run --restart=always <image>

# 失败时重启
docker run --restart=on-failure <image>

# 除非手动停止，否则重启
docker run --restart=unless-stopped <image>
```

## 总结

Docker 通过容器技术提供了轻量级、可移植的应用部署方案。掌握以上基本命令可以满足大部分日常开发和运维需求。建议：

- 使用 Docker Compose 管理多容器应用
- 合理使用数据卷保证数据持久化
- 定期清理未使用的资源
- 注意容器的资源限制和安全配置
