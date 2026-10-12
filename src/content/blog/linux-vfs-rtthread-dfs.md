---
title: 'Linux VFS 与 RT-Thread DFS 详解'
pubDate: 2024-12-03
categories: ['System']
description: 'Linux 虚拟文件系统（VFS）和 RT-Thread 设备文件系统（DFS）的架构与实现原理'
---

## Linux VFS

虚拟文件系统的目的是为了屏蔽各种各样不同文件系统的相异操作形式，使得异构的文件系统可以在统一的形式下，以标准化的方法访问、操作。实现虚拟文件系统利用的主要思想是引入一个通用文件模型——该模型抽象出了文件系统的所有基本操作，比如读、写操作等。同时实际文件系统如果希望被虚拟文件系统支持，也必须将自身的诸如"打开文件"、"读写文件"等操作行为以及"什么是文件"，"什么是目录"等概念"修饰"成虚拟文件系统所要求的（定义的）形式，这样才能够被虚拟文件系统支持和使用。

可以想象成面向对象中的多态。

按照 vfs 指定的函数签名来实现 open，read，write 等接口。

```c
static struct file_operations xx_file_ops = {
    .open        = xxfs_open,
    .read        = xxfs_read_file,
    .write       = xxfs_write_file,
};
```

### 注册文件系统

一个具体的文件系统必须先向 vfs 注册，才能被使用。通过 register_filesystem()，可以将一个"文件系统类型"结构 file_system_type 注册到内核中一个全局的链表 file_systems 上。

**文件系统注册的主要目的，就是让 VFS 创建该文件系统的"超级块"结构。**

### 安装文件系统

一个注册了的文件系统必须经过安装（挂载）才能被 VFS 所接受。安装一个文件系统，必须指定一个目录作为安装点。一个设备可以同时被安装到多个目录上。一个目录节点下可以同时安装多个设备。

#### 1. "根安装点"、"根设备"和"根文件系统"

安装一个文件系统，除了需要"被安装设备"外，还要指定一个"安装点"。"安装点"是已经存在的一个目录节点。例如把 /dev/sda1 安装到 /mnt/win 下，那么 /mnt/win 就是"安装点"。可是文件系统要先安装后使用。因此，要使用 /mnt/win 这个"安装点"，必然要求它所在文件系统也已经被安装。也就是说，安装一个文件系统，需要另外一个文件系统已经被安装。最顶层文件系统在内核初始化的时候被安装在"根安装点"上的，而根安装点不属于任何文件系统，它对应的 dentry、inode 等结构是由内核在初始化阶段构造出来的。

#### 2. 安装连接件 vfsmount

"安装"一个文件系统涉及"被安装设备"和"安装点"两个部分，安装的过程就是把"安装点"和"被安装设备"关联起来，这是通过一个"安装连接件"结构 vfsmount 来完成的。

vfsmount 将"安装点" dentry 和"被安装设备"的根目录节点 dentry 关联起来。

所以，在安装文件系统时，内核的主要工作就是：
1. 创建一个 vfsmount
2. 为"被安装设备"创建一个 super_block，并由具体的文件系统来设置这个 super_block
3. 为被安装设备的根目录节点创建 dentry
4. 为被安装设备的根目录节点创建 inode，并由 super_operations->read_inode() 来设置此 inode
5. 将 super_block 与"被安装设备"根目录节点 dentry 关联起来
6. 将 vfsmount 与"被安装设备"的根目录节点 dentry 关联起来

### 流程

#### 1. 文件系统注册

每种文件系统类型（如 EXT4, FAT, NTFS 等）在系统中被初始化时，必须向 VFS 注册其功能和操作的具体实现。这通常通过一个结构体完成，该结构体包含了一系列函数指针，这些指针指向实现了 VFS 接口定义的各种文件操作函数（如打开文件、读文件、写文件等）的具体代码。这个结构体通常被称为"文件系统类型"结构体。

#### 2. 文件操作接口

VFS 定义了一套文件操作 API，这些 API 为应用程序调用提供了标准的方法，例如 `open()`, `read()`, `write()`, `close()` 等。当这些函数被调用时，VFS 将基于打开的文件关联的文件系统类型调用相应的函数指针。例如：

- `open()` 会查找文件路径对应的文件系统，然后调用该文件系统类型结构体中的 `open()` 函数
- `read()` 和 `write()` 调用将会转到打开文件所在文件系统的相应 `read()` 或 `write()` 实现

#### 3. 路径解析与挂载点

VFS 需要能够解析文件路径，并确定路径指向的文件属于哪个文件系统。操作系统中的每个挂载点（例如 `/`, `/mnt`, `/home` 等）关联了一个特定的文件系统实例。当一个文件操作请求到达时，VFS 从根目录开始，根据路径逐级解析直到找到最终的文件系统和目标文件。

#### 4. 虚拟文件节点 (Vnode) 或索引节点 (Inode)

每个文件系统提供了一个或多个节点（通常在 UNIX 类系统中被称为 inode），这些节点包含了文件的元数据以及指向文件实际数据的链接。VFS 通过这些 inode 来操作文件数据。每个 inode 都与一个特定文件系统的操作集合相关联，这使得 VFS 可以透明地调用正确的文件系统操作。

#### 5. 示例

假设你的操作系统中有三种文件系统：EXT4, FAT 和 NTFS。当应用程序尝试打开一个文件时，如下流程将被触发：

1. 应用程序调用 `open("/mnt/usb/file.txt")`
2. VFS 解析路径 `/mnt/usb` 并识别出它挂载了一个 FAT 文件系统
3. VFS 调用在 FAT 文件系统注册时提供的 `open` 函数
4. FAT 的 `open` 函数处理具体的文件打开逻辑，可能涉及查找目录项、读取文件元数据等
5. 文件打开后，对该文件的进一步操作（如读、写）将调用 FAT 文件系统的其他函数实现

## RT-Thread DFS

RT-Thread 文件系统组件 DFS（Device File System）是一个为嵌入式设备设计的虚拟文件系统框架。DFS 提供了一套标准的文件操作接口，允许应用程序透明地访问各种类型的存储介质，包括硬盘、U盘、NAND/NOR Flash 等。

DFS 虚拟文件系统向用户应用程序提供 POSIX 接口层，POSIX 接口层是给开发者使用的接口函数层。开发者使用 POSIX 接口层提供的 POSIX API 进行文件操作，无需关心文件系统是如何实现的，也无需关心数据是存放在哪个存储设备中。

DFS 虚拟文件系统有如下功能特点：

1. 支持多种类型的存储设备
2. 支持多种类型的文件系统，提供普通文件、设备文件、网络文件描述符的管理
3. 提供统一的 POSIX 文件操作接口：read、write、poll/select 等

![RT-Thread DFS 架构](/images/vfs/image-20240410102658906.png)

代码结构如下：

![DFS 代码结构](/images/vfs/image-20240410110328526.png)

API 手册：[RT-Thread API参考手册: 文件系统](https://www.rt-thread.org/document/api/group___d_f_s.html)

### src 文件夹

dfs 虚拟文件系统层相关代码

**dfs_posix.c** 提供给用户调用的接口代码：
- `int open(const char *file, int flags, ...)` 打开文件
- `int close(int fd)` 关闭文件
- `int read(int fd, void *buf, size_t len)` 读取文件
- `int write(int fd, const void *buf, size_t len)` 写入文件
- `off_t lseek(int fd, off_t offset, int whence)` 移动文件读写位置
- `int rename(const char *old_file, const char *new_file)` 重命名文件
- `int unlink(const char *pathname)` 删除文件
- `int stat(const char *file, struct stat *buf)` 读取文件信息
- `int fstat(int fildes, struct stat *buf)` 读取文件状态
- `int fsync(int fildes)` 把文件描述符对应文件的缓冲区数据，写入对应磁盘文件，清空缓存区
- `int fcntl(int fildes, int cmd, ...)` 文件的 ioctl 接口，针对 dfs 层只能读取和设置文件 flags。对应具体文件系统，由具体文件系统的 ioctl 接口定义
- `int ioctl(int fildes, int cmd, ...)` 文件的 ioctl 接口，内部调用上面的 fcntl，如此，对外只需调用 ioctl 即可
- `int ftruncate(int fd, off_t length)` 按照 length 长度截断文件
- `int statfs(const char *path, struct statfs *buf)` 读取文件系统信息，包括 block 大小，block 总数，剩余 block 数，用于计算剩余空间
- `int mkdir(const char *path, mode_t mode)` 创建文件夹，目前 mode 内部并没有使用，无实际意义。可配置为 0x777
- `int rmdir(const char *pathname)` 删除文件夹
- `DIR *opendir(const char *name)` 打开文件夹
- `struct dirent *readdir(DIR *d)` 读取文件夹，可打开一个文件夹后，连续调用此函数遍历读取文件夹内所有子文件夹和文件，dirent 内的 d_type 表明文件类型，1 为文件，2 为文件夹
- `long telldir(DIR *d)` 读取目录流中的当前位置（尚未测试有何用途）
- `void seekdir(DIR *d, off_t offset)` 设置目录流中的读写位置（尚未测试有何用途）
- `void rewinddir(DIR *d)` 复位目录流中的读写位置（尚未测试有何用途）
- `int closedir(DIR *d)` 关闭文件夹
- `int chdir(const char *path)` 更改当前目录
- `int access(const char *path, int amode)` 测试文件是否可以访问
- `char *getcwd(char *buf, size_t size)` 读取当前路径

**dfs.c** dfs 文件系统初始化，文件句柄列表管理等接口函数：
- `int dfs_init(void)` 初始化 dfs 文件系统，如果使能 devfs，则直接挂载。此接口程序默认被 rtthread 设置为组件前自动初始化，无需用户调用。需发生在挂载底层文件系统之前
- `void dfs_lock(void)` 尝试获取 dfs 的互斥量，如果已被占用，则挂起当前线程，等待其它线程让出 dfs 操作权
- `void dfs_unlock(void)` 释放 dfs 互斥量，让出 dfs 操作权
- `static int fd_alloc(struct dfs_fdtable *fdt, int startfd)` 如果已打开的文件句柄列表内有空余句柄，则直接返回。如果没有空余，则在打开文件的时候需要新开辟空间，扩充已打开的文件句柄列表（每次扩充4个）。如果已超过同时打开文件的数量上限，则不再开辟。但这里没有直接返回错误，而是返回最大文件描述符。等待调用者做越界保护处理
- `int fd_new(void)` 调用上面的 fd_alloc 函数，申请一个空文件描述符。如果越界（没有空闲设备描述符可用）则返回 -1，否则返回 +3 的描述符。0，1，2 的文件描述符用于承载终端设备文件描述符
- `struct dfs_fd *fd_get(int fd)` 通过文件描述符，在文件句柄列表内找出对应的文件句柄
- `void fd_put(struct dfs_fd *fd)` 如果文件句柄的 ref_count 减一后为 0，则释放掉文件句柄
- `int fd_is_open(const char *pathname)` 查找某文件是否已打开，0 为打开，-1 为未打开
- `const char *dfs_subdir(const char *directory, const char *filename)` 在 filename 中去掉 directory，返回相对子目录
- `char *dfs_normalize_path(const char *directory, const char *filename)` 返回标准格式的路径
- `struct dfs_fdtable *dfs_fdtable_get(void)` 返回文件句柄列表
- `int list_fd(void)` 打印当前文件句柄列表内，已打开的文件属性

**dfs_fs.c** dfs 层对底层具体文件系统的管理接口函数：
- `int dfs_register(const struct dfs_filesystem_ops *ops)` 注册一个具体的文件系统（dev,elm 等）。具体操作为在文件系统操作符数组中，找出空闲句柄，并添加为新注册的操作符
- `struct dfs_filesystem *dfs_filesystem_lookup(const char *path)` 根据路径名，在文件系统列表中查找对应的文件系统。路径名只要包含文件系统具体挂载点即可。比如给定一个文件的绝对路径名，即可找到它所在的文件系统
- `const char *dfs_filesystem_get_mounted_path(struct rt_device *device)` 根据设备 ID，在文件系统列表中查找对应的文件系统，并返回对应文件系统的挂载点
- `int dfs_filesystem_get_partition(struct dfs_partition *part, uint8_t *buf, uint32_t pindex)` 在指定存储空间内读取分区表。一般分区表在存储设备的第一个扇区
- `int dfs_mount(const char *device_name, const char *path, const char *filesystemtype, unsigned long rwflag, const void *data)` 根据设备名，把该设备挂载到指定路径。filesystemtype 指定具体的文件系统类型，以使用具体的操作接口。rwflag 为文件系统的读写属性，data 为传的参数，是否有实际意义要看具体的文件系统操作接口。常用的 elm 和 dev 文件系统都无实际意义，直接给 0 即可。该函数需要等注册完具体的存储设备和 dfs 文件系统并在 dfs 文件系统内注册了具体的文件系统后，由用户调用，把具体的存储设备挂载到 dfs 的指定挂载点。并指定以哪种类型的文件系统操作接口处理此设备。在此之前无需 open 对应的存储设备，此函数内部会先打开存储设备再挂载
- `int dfs_unmount(const char *specialfile)` 取消挂载，在文件系统列表中删除指定文件系统，关闭存储设备。specialfile 只需包含文件系统挂载路径即可
- `int dfs_mkfs(const char *fs_name, const char *device_name)` 根据 fs_name 指定的具体文件系统类型，把 device_name 指定的实际存储设备进行格式化，构建文件系统
- `int dfs_statfs(const char *path, struct statfs *buffer)` 读取指定文件系统的信息，包括块大小，总块数以及剩余块数，可以用于查看设备剩余空间
- `void mkfs(const char *fs_name, const char *device_name)` finsh 函数命令的 mkfs 接口。使能了 MSH 后，此函数未被使用
- `int df(const char *path)` finsh 函数命令的 statfs 接口，打印存储设备的容量和剩余空间信息。使能了 MSH 后，此函数未被使用

**dfs_file.c** dfs 文件系统层对于文件相关的处理接口函数，具体实现会分别调用对应实际文件系统的操作函数接口。即 dfs 面向下层文件系统的接口，移植具体文件系统的时候需要实现对接代码：
- `int dfs_file_open(struct dfs_fd *fd, const char *path, int flags)` 按照 flags 属性打开 path 指定文件或文件夹，然后由 fd 文件句柄返回
- `int dfs_file_close(struct dfs_fd *fd)` 关闭 fd 指定的文件或文件夹
- `int dfs_file_ioctl(struct dfs_fd *fd, int cmd, void *args)` dfs 层的 ioctl 内部接口，可读取和设置文件 flags。并调用具体文件系统的 ioctl 接口实现底层具体功能
- `int dfs_file_read(struct dfs_fd *fd, void *buf, size_t len)` dfs 层的 read 接口，调用具体文件系统的 read 接口实现读取功能
- `int dfs_file_getdents(struct dfs_fd *fd, struct dirent *dirp, size_t nbytes)` 根据文件操作符，读取 dirent 结构体对应的属性信息
- `int dfs_file_unlink(const char *path)` dfs 层删除接口，调用具体文件系统的 unlink 接口实现文件或文件夹的删除功能
- `int dfs_file_write(struct dfs_fd *fd, const void *buf, size_t len)` dfs 层的 write 接口，调用具体文件系统的 write 接口实现写入功能
- `int dfs_file_flush(struct dfs_fd *fd)` dfs 层的同步接口，调用具体文件系统的 flush 接口实现文件的同步，即把文件句柄内的缓存数据真正写入到存储设备
- `int dfs_file_lseek(struct dfs_fd *fd, off_t offset)` dfs 层的 lseek 接口，调用具体文件系统的 lseek 接口，实现对文件读取位置的移动
- `int dfs_file_stat(const char *path, struct stat *buf)` dfs 层的读取文件属性接口，也会调用具体文件系统的 stat 接口
- `int dfs_file_rename(const char *oldpath, const char *newpath)` dfs 层的 rename 接口，调用底层具体文件系统的 rename 接口，实现文件重命名
- `int dfs_file_ftruncate(struct dfs_fd *fd, off_t length)` 调用具体文件系统的 ioctl 接口，实现对文件 fd 的截断（length 字节）
- `void ls(const char *pathname)` finsh 的 ls 命令函数
- `void rm(const char *filename)` finsh 的 rm 命令函数
- `void cat(const char *filename)` finsh 的 cat 命令函数
- `static void copyfile(const char *src, const char *dst)` dfs 层实现的文件拷贝函数
- `static void copydir(const char *src, const char *dst)` dfs 层实现的文件夹拷贝函数，遍历子文件夹，把所有子文件拷贝到目标文件夹
- `static const char *_get_path_lastname(const char *path)` 通过 path 路径，得到最后一级路径名
- `void copy(const char *src, const char *dst)` finsh 的 copy 命令函数，调用上面的 copyfile 和 copydir 实现

### filesystems 文件夹

dfs 支持的具体文件系统，默认会有一个 devfs 文件夹，对应设备文件系统。开启了 elm 的 fat 文件系统模块后，会多一个 elmfat 文件夹，对应 fatfs 的代码。

### elmfat 文件夹

fatfs 对应的代码，其中 ff.c 为 fatfs 代码，dfs_elm.c 为 RTT 实现的移植代码，承上启下，完成 dfs 的调用接口和与 fatfs 对接的接口，并通过具体设备（flash, sdcard）的操作接口实现具体的功能。

**dfs_elm.c** 相对直接移植 fatfs 时 diskio.c 要实现的接口外，又多了一些和 dfs 层对接的接口。下面针对 dfs_elm.c 下的接口函数做简单说明：
- `static int elm_result_to_dfs(FRESULT result)` 做 fatfs 下的返回状态与 dfs 下的返回状态的转换
- `static int get_disk(rt_device_t id)` 根据设备 ID，在挂载的磁盘列表中找到磁盘列表 ID
- `int dfs_elm_mount(struct dfs_filesystem *fs, unsigned long rwflag, const void *data)` 承上启下，连接 dfs 层和 fatfs 内的 mount 接口，实现设备挂载，把设备 ID 添加到挂载的磁盘列表内
- `int dfs_elm_unmount(struct dfs_filesystem *fs)` 承上启下，连接 dfs 层和 fatfs 内的 unmount 接口，实现设备取消挂载，把设备 ID 从磁盘列表中删除
- `int dfs_elm_mkfs(rt_device_t dev_id)` 承上启下，连接 dfs 层和 fatfs 内的 mkfs 接口，实现存储设备的格式化
- `int dfs_elm_statfs(struct dfs_filesystem *fs, struct statfs *buf)` 承上启下，连接 dfs 层和 fatfs 内的 statfs 和 getfree 接口，读取文件系统的存储空间信息
- `int dfs_elm_open(struct dfs_fd *file)` 承上启下，连接 dfs 层和 fatfs 内的 open 或 opendir 接口，实现打开文件或文件夹功能
- `int dfs_elm_close(struct dfs_fd *file)` 承上启下，连接 dfs 层和 fatfs 内的 close 接口，实现关闭文件或文件夹功能
- `int dfs_elm_ioctl(struct dfs_fd *file, int cmd, void *args)` 承上启下，连接 dfs 层和 fatfs 内的 ioctl 接口，实现文件截断功能
- `int dfs_elm_read(struct dfs_fd *file, void *buf, size_t len)` 承上启下，连接 dfs 层和 fatfs 内的 read 接口，实现文件读取功能
- `int dfs_elm_write(struct dfs_fd *file, const void *buf, size_t len)` 承上启下，连接 dfs 层和 fatfs 内的 write 接口，实现文件写入功能
- `int dfs_elm_flush(struct dfs_fd *file)` 承上启下，连接 dfs 层和 fatfs 内的 flush 和 sync 接口，实现文件的同步功能，把缓存数据写入磁盘
- `int dfs_elm_lseek(struct dfs_fd *file, rt_off_t offset)` 承上启下，连接 dfs 层和 fatfs 内的 lseek 或 seekdir 接口，实现文件或文件夹的操作位置移动
- `int dfs_elm_getdents(struct dfs_fd *file, struct dirent *dirp, uint32_t count)` 承上启下，调用 fatfs 的 readdir 接口，实现 dfs 层的 getdents 接口，读取文件 dirent 属性
- `int dfs_elm_unlink(struct dfs_filesystem *fs, const char *path)` 承上启下，连接 dfs 层和 fatfs 内的 funlink 接口，实现文件的删除功能
- `int dfs_elm_rename(struct dfs_filesystem *fs, const char *oldpath, const char *newpath)` 承上启下，连接 dfs 层和 fatfs 内的 rename 接口，实现改文件名的功能
- `int dfs_elm_stat(struct dfs_filesystem *fs, const char *path, struct stat *st)` 承上启下，连接 dfs 层和 fatfs 内的 stat 接口，实现读取文件 stat 信息的功能
- `int elm_init(void)` 调用 dfs 层的 dfs_register 接口，把"elm"的文件系统操作接口注册到 dfs 文件系统中。用于后面按照"elm"类型挂载实际的存储设备。此函数被 RTT 加入到了组件初始化列表，会自动运行，无需用户调用
- `DSTATUS disk_initialize(BYTE drv)` 此函数为 fatfs 的初始化磁盘设备的接口，由于 RTT 实际初始化磁盘设备的代码也被加入到了自动初始化列表，所以此接口直接返回 OK 即可
- `DSTATUS disk_status(BYTE drv)` 此函数为 fatfs 读取磁盘设备状态的接口。RTT 的移植，并没有对此函数做具体实现，直接返回的 OK
- `DRESULT disk_read(BYTE drv, BYTE *buff, DWORD sector, UINT count)` 此函数为 fatfs 读取磁盘扇区数据的接口，对接具体的设备驱动读取接口
- `DRESULT disk_write(BYTE drv, const BYTE *buff, DWORD sector, UINT count)` 此函数为 fatfs 写入磁盘扇区数据的接口，对接具体的设备驱动写入接口
- `DRESULT disk_ioctl(BYTE drv, BYTE ctrl, void *buff)` 此函数为 fatfs 的 ioctl 接口，对接具体设备驱动的 control 接口
- `DWORD get_fattime(void)` 此函数为 fatfs 获取系统时间的接口，用于记录文件和文件夹的创建和修改时间
- `int ff_cre_syncobj(BYTE drv, FF_SYNC_t *m)` 如开启文件重入功能，则需要实现重入保护相关代码，RTT 利用互斥量实现，此接口创建互斥量。FF_SYNC_t 到 rt_mutex_t 的重定义在 ffconf.h 中定义
- `int ff_del_syncobj(FF_SYNC_t m)` fatfs 的删除互斥量的接口
- `int ff_req_grant(FF_SYNC_t m)` fatfs 的获取互斥量的接口
- `void ff_rel_grant(FF_SYNC_t m)` fatfs 的释放互斥量的接口
- `void *ff_memalloc(UINT size)` 当定义 FF_USE_LFN == 3 的时候，长文件名需要在堆上面开辟空间，此时需要实现 fatfs 开辟存储空间的接口，对应 rt_malloc 接口
- `void ff_memfree(void *mem)` fatfs 释放存储空间的接口，对应 rt_free 接口

## 设计

相较于 rtthread 的 dfs，我们的设计不用支持文件系统的动态挂载，即一个文件系统可以挂载到根文件系统的任意目录位置。我们的设计将三种文件系统管理的设备各自分配一个盘符，来模拟挂载到根文件系统这一步骤，盘符用来区分不同的文件系统。后续根据路径即可定位到具体的文件系统。

![文件系统设计](/images/vfs/image-20240410100848580.png)

### 1. 定义统一的文件操作接口

VFS 层定义一个统一的文件抽象。具体对应三种文件系统中不同的文件句柄：

```c
struct vfs_file
{
    uint16_t magic;
    off_t fpos;
    struct mutex lock;

    const struct file_system_ops *ops;
    void *data;
};
```

VFS 层定义一个 `file_system_type` 结构体，这是向 VFS 注册文件系统时使用的主要数据结构：

```c
struct file_system_type
{
    const char *name;
    const struct file_system_ops *ops;
    struct file_system_type *next;
    int (*mount)(struct file_system_type *fs, const char *source, const void *options);
    int (*unmount)(struct file_system_type *fs);
    void *private_data; // 可以用于存储文件系统特有的数据
};

// 根据不同文件系统的操作函数，定义一个合理的统一接口。具体文件系统需要将自己的函数封装成接口的这种形式
struct file_system_ops
{
    int (*open)(const char *pathname, int flags);
    int (*close)(vfs_file *fd);
    ssize_t (*read)(vfs_file *fd, void *buf, size_t count);
    ssize_t (*write)(vfs_file *fd, const void *buf, size_t count);
    int (*mkdir)(const char *pathname, mode_t mode);
    // 其他必要的函数原型
};

// 根据路径名，在文件系统列表中查找对应的文件系统。比如给定一个文件的绝对路径名，即可找到它所在的文件系统
struct file_system_type* file_system_lookup(const char *pathname);
```

![VFS 操作流程](/images/vfs/image-20240410152144977.png)

### 2. 文件系统实例注册

为每个文件系统（FAT, LittleFS, YAFFS2）定义操作函数，然后创建相应的 `file_system_type` 实例：

```c
file_system_ops fat_ops = {
    .open = fat_open, 
    .close = fat_close,
    .read = fat_read,
    .write = fat_write,
    // 更多操作的实现
};

file_system_type fat_fs = {
    .name = "fat",
    .ops = &fat_ops,
    .mount = fat_mount,
    .unmount = fat_unmount,
    .private_data = NULL,
};

// 类似地，为 LittleFS 和 YAFFS2 定义操作
```

### 3. VFS 层的实现

实现 VFS 层的核心功能，例如，将文件操作请求转发到正确的文件系统实现。

定义一个统一的文件描述符抽象：

```c
int vfs_open(const char *pathname, int flags) {
    // 确定路径所在的文件系统
    file_system_type *fs = file_system_lookup(pathname);
    if (fs && fs->ops->open)
        return fs->ops->open(pathname, flags);
    return -ENOSYS;
}

int vfs_read(vfs_file *fd, void *buf, size_t count) {
    file_system_type *fs = get_fs_for_fd(fd);
    if (fs && fs->ops->read)
        return fs->ops->read(fd, buf, count);
    return -ENOSYS;
}

// 其他封装实现
```

### 4. VFS 层提供给用户接口

```c
int open(const char *pathname, int flags); // 调用 vfs_open
int close(int fd);
ssize_t read(int fd, void *buf, size_t count);
ssize_t write(int fd, const void *buf, size_t count);
int mkdir(const char *pathname, mode_t mode);
```

![文件描述符管理](/images/vfs/image-20240410100448932.png)

![VFS 层次结构](/images/vfs/image-20240410100357189.png)

在 open 时将 fd 返回给用户，fd 与一个 vfs 相对应。
