---
title: Git 使用指南
date: 2023-11-22
description: Git 版本控制系统的完整使用指南，包括基本配置、提交管理、分支操作和远程协作。
categories: [DevOps]
---

## Git 基础配置

### 检查版本

```bash
git --version
```

### 配置 Git

我们通常会将 git 配置为我们在 GitHub 上注册的用户名和邮箱。`global` 关键字会为系统中的每个版本库设置配置。我们可以去掉 `global` 关键字，只对当前仓库进行配置。

```bash
# 配置
git config --global user.name "Dueplay"
git config --global user.email "2289535823@qq.com"

# 查看配置
git config user.name
git config user.email

# 查看所有配置
git config --list
```

### 初始化仓库

创建一个新的 repo，并初始化 git 以跟踪一个文件夹：

```bash
mkdir myproject && cd myproject
git init
```

在 myproject 有个隐藏文件夹 `.git`，这是 git 为我们存储所有跟踪信息的地方。

## Git 基本操作

### 检查状态

```bash
git status
```

输出示例：
```
On branch master

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
    index.html

nothing added to commit but untracked files present (use "git add" to track)
```

### 暂存更改

在 Git 中，"暂存"（Staging）指的是将**工作目录中的修改或新文件添加到 Git 的索引中（也称为暂存区），以便随后 commit 这些更改**。暂存的主要目的是允许选择性地 commit 文件而不是全部文件的修改。

在 git 中，每个文件都可能处于两个阶段中的一个：

- **已跟踪**：git 会主动监控该文件的任何更改，并将其作为 repo 的一部分
- **未跟踪**：虽然文件存在，但 git 会"忽略"它的存在和变化

```bash
# 添加单个文件
git add index.html

# 添加所有修改
git add .

# 取消暂存
git restore --staged [filename]
```

### 提交更改

```bash
git commit -m "First release of Git Helloworld Project"
```

可以跳过暂存阶段，一步到位地 commit 变更（不建议这样做）：

```bash
git commit -a -m [commit message]
```

### 打标签

`git tag` 用于给 Git 中的 commit 打上标签（tag），这些标签通常用于标识某个特殊的 commit，比如软件版本发布。

```bash
# 创建带注释的标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 列出所有标签
git tag -l

# 推送标签到远程
git push origin v1.0.0

# 推送所有标签
git push origin --tags

# 删除本地标签
git tag -d v1.0.0

# 删除远程标签
git push origin --delete v1.0.0
```

### 查看提交历史

```bash
# 查看详细历史
git log

# 查看精简历史
git log --oneline

# 查看图形化历史
git log --oneline --graph --all

# 查看某个文件的历史
git log -- <filename>
```

## 分支管理

### 创建和切换分支

```bash
# 创建分支
git branch <branch-name>

# 切换分支
git checkout <branch-name>

# 创建并切换分支（推荐）
git checkout -b <branch-name>

# 或使用新命令
git switch -c <branch-name>
```

### 查看分支

```bash
# 查看本地分支
git branch

# 查看所有分支（包括远程）
git branch -a

# 查看远程分支
git branch -r
```

### 合并分支

```bash
# 合并指定分支到当前分支
git merge <branch-name>

# 取消合并
git merge --abort
```

### 删除分支

```bash
# 删除本地分支
git branch -d <branch-name>

# 强制删除本地分支
git branch -D <branch-name>

# 删除远程分支
git push origin --delete <branch-name>
```

## 远程仓库

### 添加远程仓库

```bash
git remote add origin <repository-url>
```

### 查看远程仓库

```bash
# 查看远程仓库
git remote -v

# 查看远程仓库详细信息
git remote show origin
```

### 推送到远程

```bash
# 推送到远程分支
git push origin <branch-name>

# 首次推送并设置上游分支
git push -u origin <branch-name>

# 推送所有分支
git push --all origin
```

### 拉取远程更改

```bash
# 拉取并合并
git pull origin <branch-name>

# 仅拉取不合并
git fetch origin

# 拉取所有远程分支
git fetch --all
```

### 克隆仓库

```bash
git clone <repository-url>

# 克隆指定分支
git clone -b <branch-name> <repository-url>
```

## 撤销操作

### 撤销工作区的修改

```bash
# 撤销单个文件的修改
git checkout -- <filename>

# 或使用新命令
git restore <filename>

# 撤销所有修改
git restore .
```

### 撤销暂存区的文件

```bash
# 取消暂存单个文件
git reset HEAD <filename>

# 或使用新命令
git restore --staged <filename>

# 取消所有暂存
git reset HEAD
```

### 撤销提交

```bash
# 撤销最后一次提交，保留更改
git reset --soft HEAD~1

# 撤销最后一次提交，不保留更改
git reset --hard HEAD~1

# 修改最后一次提交信息
git commit --amend -m "New commit message"

# 修改最后一次提交内容
git add <forgotten-file>
git commit --amend --no-edit
```

## 储藏（Stash）

### 储藏当前工作

```bash
# 储藏当前工作
git stash

# 储藏并添加说明
git stash save "Work in progress"

# 储藏包括未跟踪的文件
git stash -u
```

### 查看储藏列表

```bash
git stash list
```

### 恢复储藏

```bash
# 恢复最近的储藏
git stash pop

# 恢复指定的储藏
git stash pop stash@{0}

# 应用储藏但不删除
git stash apply

# 删除储藏
git stash drop stash@{0}

# 清空所有储藏
git stash clear
```

## 查看差异

```bash
# 查看工作区与暂存区的差异
git diff

# 查看暂存区与最后一次提交的差异
git diff --staged

# 查看两个提交之间的差异
git diff <commit1> <commit2>

# 查看某个文件的差异
git diff <filename>
```

## Rebase

```bash
# 将当前分支 rebase 到指定分支
git rebase <branch-name>

# 交互式 rebase（修改历史提交）
git rebase -i HEAD~3

# 继续 rebase
git rebase --continue

# 中止 rebase
git rebase --abort
```

## Cherry-pick

```bash
# 将指定提交应用到当前分支
git cherry-pick <commit-hash>

# 应用多个提交
git cherry-pick <commit1> <commit2>

# 取消 cherry-pick
git cherry-pick --abort
```

## 帮助命令

```bash
# 查看命令帮助
git help <command>

# 或
git <command> --help

# 简短帮助
git <command> -h
```

## 常用场景

### 撤销已经推送的提交

```bash
# 创建一个新提交来撤销指定提交
git revert <commit-hash>

# 推送撤销提交
git push origin <branch-name>
```

### 合并多个提交

```bash
# 交互式 rebase
git rebase -i HEAD~3

# 在编辑器中将 pick 改为 squash 或 s
# 保存退出后编辑合并后的提交信息
```

### 同步 fork 的仓库

```bash
# 添加上游仓库
git remote add upstream <original-repo-url>

# 拉取上游更改
git fetch upstream

# 合并上游更改
git merge upstream/main

# 推送到自己的远程仓库
git push origin main
```

## .gitignore

创建 `.gitignore` 文件来忽略不需要跟踪的文件：

```gitignore
# 忽略所有 .log 文件
*.log

# 忽略 node_modules 目录
node_modules/

# 忽略 build 目录
build/
dist/

# 忽略 IDE 配置
.vscode/
.idea/

# 但不忽略特定文件
!important.log
```

## 总结

Git 是现代软件开发中不可或缺的版本控制工具。掌握基本的 Git 操作可以大大提高开发效率和团队协作能力。

**建议**：
- 频繁提交，保持提交的原子性
- 写清晰的提交信息
- 使用分支进行功能开发
- 定期推送到远程仓库
- 了解 rebase 和 merge 的区别
- 善用 .gitignore 管理不需要跟踪的文件
