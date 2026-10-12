---
title: "数据库事务隔离级别详解"
date: 2024-12-03
categories: ['Database']
description: '详细介绍数据库事务的三种隔离级别：READ_UNCOMMITTED、READ_COMMITTED和REPEATABLE_READ，包括各级别的锁机制、并发问题以及应用场景'
---

## 隔离级别

### 1. READ_UNCOMMITTED

它允许一个事务在另一个事务未提交的数据上执行读取操作,甚至在其他事务正在对这些数据进行修改的情况下也是可以的。事务不会对`读取的数据`应用共享锁（S 锁）、排他锁（X 锁）或范围锁（IS 锁、IX 锁等），事务只能获得IX，X，并且还只能在growing阶段获得。

1. **共享锁（S 锁）**：在其他隔离级别中，读取操作可能会对数据应用共享锁，以防止其他事务修改这些数据。但在 READ_UNCOMMITTED 下，由于不关心其他事务的提交状态，甚至其他事务再写也可以读，所以不需要对读取的数据应用共享锁，以提供更好的并发。
2. **范围锁（IS 锁、IX 锁等）**：这些锁通常用于保护一定范围的数据，以防止其他事务在该范围内进行修改。在 READ_UNCOMMITTED 下，不需要对读取的数据应用范围锁，因为允许读取未提交的数据，而不考虑其他事务可能对这些数据进行的修改。

READ_UNCOMMITTED 隔离级别提供了最低的隔离水平，因此在读取数据时不会强制要求对数据进行锁定。这使得在该隔离级别下可以更自由地读取数据，但也增加了数据一致性和事务安全性的风险。

### 2. REPEATABLE_READ

使用 `REPEATABLE_READ` 隔离级别的一个目标是确保事务在其生命周期内可以多次读取相同的数据而不受其他事务的干扰。通过获取共享锁或排他锁，`REPEATABLE_READ` 隔离级别保证了在事务执行期间，数据的一致性和可重复性。在这个隔离级别下，事务需要获取所有锁。只允许在growing阶段获得，不允许在shrinking阶段获得锁

**All locks are allowed in the GROWING state**

**No locks are allowed in the SHRINKING state**

`REPEATABLE_READ` 隔离级别可以防止出现脏读（dirty read）、不可重复读（non-repeatable read）和幻读（phantom read）的问题，但它并不能解决所有的并发问题。

### 3. READ_COMMITTED

在 `READ_COMMITTED` 隔离级别下，事务需要获得共享锁（S锁）或排他锁（X锁），具体的锁取决于对数据的读写操作。

 **All locks are allowed in the GROWING state**

 **Only IS, S locks are allowed in the SHRINKING state**

在 `READ_COMMITTED` 隔离级别中，虽然共享锁可以防止其他事务在读取数据的同时对其进行修改，但由于事务只能看到已提交的数据，因此在事务之间仍然存在一些并发问题，例如不可重复读（non-repeatable read）和幻读（phantom read）。

`READ_COMMITTED` 是相对较低的隔离级别，可以提供较好的并发性能，但在一些特定场景下可能会出现一些并发问题。
