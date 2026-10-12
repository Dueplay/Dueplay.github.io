---
title: '英语词汇学习笔记（二）'
date: 2024-12-03
categories: ['English']
description: '并发编程和多线程相关的英语词汇，包含条件变量、线程同步等概念'
---

## 词汇列表

**ahead of time** - 提前

**grants/denies** - 批准/拒绝

**downgrade** - 降级

**Violation** - 违反，侵害

**permissible** - 允许的

**prefer correctness before performance** - 优先考虑正确性而不是性能

**Rigorous** - 严格的

**starvation** - 饥饿

**granularity** - 粒度

**coarser** - 粗

**likelihood** - 可能性

**monotonous** - 单调的

**Propagate** - 传播

**Phantom Reads** - 幻读

**pertaining** - 关于，属于

**acknowledgement** - 确认

**batch** - 批量，批次

**amortize** - 缓冲，分期清偿

**amortize overhead** - 分摊开销

**after an elapsed amount of time** - 经过一段时间后

**elapsed** - 过去

**mutable** - 易变的，性情不定的

**Resume** - 恢复

**stall** - 停止，拖延

**just as bad** - 同样糟糕

**tunable** - 可协调

**trivial** - 简单的

**be prioritised over** - 优先于

**certain circumstances** - 某些情况

**wrapper** - 包装器，包装，皮

**coordination** - 协调，协作

**depending upon the** - 取决于

**at all** - 根本

**applicable** - 可适用，可应用

## 条件变量使用说明

当线程调用 `cv.wait(lock, pred)` 时的执行流程：

1. 当线程调用 `cv.wait(lock, pred)` 时，它会持有 `lock` 参数所表示的锁
2. `pred` 谓词会被检查。如果 `pred` 返回 `false`，则当前线程会释放锁，同时进入等待状态。在这个阶段，它让出了锁，允许其他线程获取这个锁并修改相关的共享数据
3. 当另一个线程修改了共享数据，并调用了条件变量上的通知操作（例如 `cv.notify_one()` 或 `cv.notify_all()`），等待的线程会被唤醒
4. 一旦被唤醒，线程会重新获得之前释放的锁，并重新检查 `pred`。如果 `pred` 此时返回 `true`，则线程继续执行；如果返回 `false`，则线程可能再次释放锁并重新等待

这种设计允许线程在等待期间响应条件的变化，同时确保在获得锁后重新检查 `pred` 以确保条件仍然满足。这有助于避免虚假唤醒（spurious wakeups）的问题，即即使没有明确的通知，等待的线程也可能被唤醒。
