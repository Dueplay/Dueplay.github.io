---
title: Redis 基础命令与数据结构
date: 2023-11-23
description: Redis 常用命令和数据结构详解，包括 String、List、Set、Sorted Set 和 Hash 的使用方法。
categories: [Database]
---

Redis 是一个高性能的键值数据库，支持多种数据结构，广泛应用于缓存、消息队列、排行榜等场景。

## Redis 基础操作

### 启动 Redis

启动 Redis 服务端，配置文件默认在 `/etc/redis/` 中，默认端口是 6379：

```bash
redis-server /path/redis.conf
```

### 启动客户端

```bash
redis-cli -h ip -p port
```

### 基本命令

```bash
# 设置键值
set k v

# 查询
get k

# 删除
del k

# 查看所有的 key
keys *

# 按模式查找
keys pattern

# 判断 key 是否存在
exists key

# 删除所有数据
flushall

# 查看 key 的过期时间，输出 -1 表示未设置过期时间
TTL key

# 设置 key 的过期时间，单位为秒。过期后 get key 无输出
expire key seconds

# 设置一个带有过期时间的键值对
setex key seconds value

# key 不存在时设置，存在则不做操作
setnx key value
```

### 中文支持

Redis 默认以二进制的形式存储，不支持中文显示。需要支持中文要在启动时加 `--raw` 以原始的形式来显示内容：

```bash
redis-cli --raw
```

## 数据结构

### List（列表）

用来存储和操作一组有顺序的数据，类似数组。

#### 添加元素

`LPUSH` 和 `RPUSH` 将元素插入到头部和尾部：

```bash
# lpush/rpush 列表名 元素1 元素n
# 元素按照从左到右的顺序依次插入到头部/尾部
lpush letter a
rpush letter b c d
```

#### 获取列表内容

`LRANGE key start stop`：

```bash
# 列表名 起始pos 结尾pos
# pos 以 0 开始，-1 表示最后一个元素
lrange letter 0 -1

# 示例
127.0.0.1:6379> rpush letter b c d
(integer) 4
127.0.0.1:6379> lrange letter 0 -1
1) "a"
2) "b"
3) "c"
4) "d"

127.0.0.1:6379> lpush letter x y z
(integer) 7
127.0.0.1:6379> lrange letter 0 -1
1) "z"
2) "y"
3) "x"
4) "a"
5) "b"
6) "c"
7) "d"
```

#### 删除元素

`LPOP` 和 `RPOP` 从列表头部或者尾部删除元素：

```bash
# 删除前面 n 个
LPOP key n
RPOP key n
```

#### 其他操作

```bash
# 查看列表长度
LLEN key

# 删除列表中指定范围以外的元素，只保留 [start, stop] 之间的元素
LTRIM key start stop
```

### Set（集合）

List 中元素可以重复，Set 中元素不能重复，且不具有顺序。相关命令以 S 开头。

#### 添加元素

```bash
# sadd key 元素1 ... 元素n
sadd course redis os mysql
```

#### 查看集合

```bash
# smembers key
smembers course
```

#### 判断元素是否在集合中

输出 0 为 false，1 为 true：

```bash
sismember course member
```

#### 删除元素

```bash
srem key member1 member2...
```

#### 集合运算

```bash
# 交集
SINTER key1 key2

# 并集
SUNION key1 key2

# 差集
SDIFF key1 key2
```

### Sorted Set（有序集合，ZSet）

有序集合中的每一个元素都会关联浮点类型的分数，然后按照这个分数对集合中元素进行从小到大的排序。分数相同按照字典序排序。

有序集合的成员是唯一的，但是关联的分数可以重复。相关命令以 Z 开头。

#### 添加元素

```bash
# zadd key 分数1 成员1 分数2 成员2 ...
zadd grade 99 gxj 100 wsq 95 zs 98 ls
```

#### 查看集合

```bash
# ZRANGE key start stop [WITHSCORES]
# 不带分数
ZRANGE grade 0 -1

# 带分数
ZRANGE grade 0 -1 WITHSCORES
```

#### 查看成员分数

```bash
# zscore key member
zscore grade gxj
```

#### 查看成员索引

从 0 开始：

```bash
# zrank key member
zrank grade gxj
```

#### 查看成员排名

REV 表示 reverse（倒序）：

```bash
# zrevrank key member
zrevrank grade gxj
```

#### 删除成员

```bash
ZREM key member
```

### Hash（哈希）

字符串类型的字段和值的映射表，key-value 的集合，适合用于存储对象。将对象表示为一组键值对。

命令以 H 开头。

#### 添加键值对

```bash
# HSET key field value [field value ...]
HSET person name gxj
HSET person age 24
```

#### 获取键值对

```bash
# HGET key field
# 获取 person 中的 name
HGET person name

# 获取 person 中的 age
HGET person age
```

#### 获取所有键值对

```bash
HGETALL key
HGETALL person
```

#### 删除键值对

```bash
HDEL key field
HDEL person age
```

#### 判断键值对是否存在

```bash
HEXISTS key field
HEXISTS person name
```

## 常用场景

### 缓存

使用 String 类型存储缓存数据，设置过期时间：

```bash
# 设置缓存，过期时间 3600 秒
SETEX user:1001 3600 '{"name":"张三","age":25}'
```

### 排行榜

使用 Sorted Set 实现排行榜：

```bash
# 添加分数
ZADD leaderboard 1000 user1 950 user2 1200 user3

# 获取排行榜前 10 名
ZREVRANGE leaderboard 0 9 WITHSCORES

# 获取某个用户的排名
ZREVRANK leaderboard user1

# 增加分数
ZINCRBY leaderboard 50 user1
```

### 计数器

使用 String 类型实现计数器：

```bash
# 初始化计数器
SET counter 0

# 自增
INCR counter

# 增加指定值
INCRBY counter 10

# 自减
DECR counter

# 减少指定值
DECRBY counter 5
```

### 分布式锁

使用 SETNX 实现简单的分布式锁：

```bash
# 尝试获取锁
SETNX lock:resource 1

# 设置锁的过期时间，防止死锁
EXPIRE lock:resource 30

# 或者使用 SET 命令一步完成
SET lock:resource 1 EX 30 NX

# 释放锁
DEL lock:resource
```

### 消息队列

使用 List 实现简单的消息队列：

```bash
# 生产者推入消息
LPUSH queue:task '{"id":1,"type":"email"}'

# 消费者获取消息（阻塞式）
BRPOP queue:task 0
```

## 持久化

### RDB（Redis Database）

将内存中的数据快照保存到磁盘：

```bash
# 手动触发快照
SAVE

# 异步触发快照
BGSAVE
```

### AOF（Append Only File）

记录每个写操作，通过重放日志恢复数据。

## 总结

Redis 提供了丰富的数据结构和命令，可以满足各种场景的需求：

- **String**：适合缓存、计数器
- **List**：适合消息队列、时间线
- **Set**：适合标签、去重
- **Sorted Set**：适合排行榜、延时队列
- **Hash**：适合存储对象

掌握这些基本操作可以高效地使用 Redis 解决实际问题。
