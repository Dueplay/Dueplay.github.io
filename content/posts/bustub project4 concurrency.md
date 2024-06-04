---
title: "bustub project4 concurrency"
date: 2023-12-25T22:20:01+08:00
# weight: 1
# aliases: ["/first"]
tags: ["bustub"]
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

### overview

- Lock Manager：锁管理器，利用 2PL 实现并发控制。支持 `REPEATABLE_READ`、`READ_COMMITTED` 和 `READ_UNCOMMITTED` 三种隔离级别，支持 `SHARED`、`EXCLUSIVE`、`INTENTION_SHARED`、`INTENTION_EXCLUSIVE` 和 `SHARED_INTENTION_EXCLUSIVE` 五种锁，支持 table 和 row 两种锁粒度，支持锁升级。Project 4 重点部分。
- Deadlock Detection：死锁检测，运行在一个 后台线程，每间隔一定时间检测当前是否出现死锁，并挑选合适的事务将其 abort 以解开死锁。
- Concurrent Query Execution：修改之前实现的 `SeqScan`、`Insert` 和 `Delete` 算子，加上适当的锁以实现并发的查询。

### Lock Manager

首先理一理 Lock Manager 的成员：

- `table_lock_map_`：记录 table 和与其相关锁请求的map。
- `row_lock_map_`：记录 row 和与其相关锁请求的map。

这两个 map 的值均为锁请求队列 `LockRequestQueue`：

- `request_queue_`：实际存放锁请求的队列
- `cv_` & `latch_`：条件变量和锁，配合使用可以实现经典的等待资源模型。
- `upgrading_`：正在此资源上尝试锁升级的事务 id。

锁请求以 `LockRequest` 表示：

- `txn_id_`：发起此请求的事务 id。
- `lock_mode_`：请求锁的类型,有*S,X,IS,IX,SIX*。
- `oid_`：在 table 粒度锁请求中，代表 table id。在 row 粒度锁请求中，表示 row 属于的 table 的 id。
- `rid_`：仅在 row 粒度锁请求中有效。指 row 对应的 rid。
- `granted_`：是否已经对此请求授予锁
- `on_table_`: 锁请求是在表上还是在行上

Lock Manager 的作用:

为了确保事务操作的正确交错，DBMS 将使用锁管理器 (LM) 来控制何时允许事务访问数据项。LM 的基本思想是它维护一个有关活动事务当前持有的锁的内部数据结构。然后，事务在被允许访问数据项之前向 LM 发出锁定请求。LM 将向调用事务授予锁定、阻止该事务或中止它。

例如有一个 SeqScan 算子需要扫描某张表，其所在事务就需要对这张表加 S 锁。而加读锁这个动作需要由 Lock Manager 来完成。事务先对向 Lock Manager 发起加 S 锁请求，Lock Manager 对请求进行处理。如果发现此时没有其他的锁与这个请求冲突，则授予其 S 锁并返回。如果存在冲突，例如其他事务持有这张表的 X 锁，则 Lock Manager 会阻塞此请求（即阻塞此事务），直到能够授予 S 锁，再授予并返回。

### Lock

判断一个锁请求是否有效

1.根据请求的是锁表还是锁行的flag判断

- 表：支持所有的锁类型

- 行：只支持 S 和 X 锁

2.判断事务隔离级别

```
REPEATABLE_READ:
   The transaction is required to take all locks.
   All locks are allowed in the GROWING state
   No locks are allowed in the SHRINKING state
   
READ_COMMITTED:
   The transaction is required to take all locks.
   All locks are allowed in the GROWING state
   Only IS, S locks are allowed in the SHRINKING state
   
READ_UNCOMMITTED:
   The transaction is required to take only IX, X locks.
   X, IX locks are allowed in the GROWING state.
   S, IS, SIX locks are never allowed
```

- `REPEATABLE_READ`：不允许在SHRINKING阶段获取任何锁,否则抛`LOCK_ON_SHRINKING`异常
- `READ_COMMITTED`: 在SHRINKING阶段只允许IS/S锁, 如果在事务在SHRINKING阶段这个锁请求不是IS/S, 则抛`LOCK_ON_SHRINKING`异常
- `READ_UNCOMMITTED`: 只允许IX, X锁, 如果不是X/IX则抛`LOCK_SHARED_ON_READ_UNCOMMITTED`异常,SHRINKING阶段不允许任何锁请求, 如果该事务处于SHRINKING阶段则抛`LOCK_ON_SHRINKING`异常.

每种隔离级别会带来的问题如下图, 不同的隔离级别是性能与一致性的权衡

![15-445-4-1](E:\db资料\database\P4 并发控制.assets\15-445-4-1.png)

3.如果是锁行,判断行所在的表是否持有相应的锁

- 如果在行上请求X锁,则表应该持有X,IX,SIX

- 如果在行上请求S锁,则表应该持有任意一种锁

4.判断锁升级(upgrade)

请求锁表

- 该表已经持有一种锁,又申请锁,则为upgrade的情况

请求锁行

- 该行已经持有S或者锁,又申请锁,则为upgrade的情况

是upgrade的话: 根据upgrade_matrix_判断该次锁请求是否与已经持有的锁兼容, 不兼容返回false, 兼容的情况再当前该表该行的锁请求队列中是否有事务upgrade, 如果有则返回false, 对给定资源的锁定只允许一个 txn 升级. 

注意:在不兼容和已经有事务在该资源上upgrade下还需要看下当前请求是否和已经持有的请求相同, 相同则不应该为false. 

LockTable实现思路(LockRow同理)：

1.判断该lockrequest是否有效

无效则修改事务txn的状态为终止,并抛出异常

有效再检查是否为upgrade, 是upgrade且该请求的lock和该txn在该资源上已经持有的lock相同直接返回. 不相同的情况则进行upgrade操作, upgrade操作等同释放当前已经持有的锁，并在 queue 中标记我正在尝试升级,然后再尝试加锁. 也就是先释放此前持有的锁，把升级作为一个新的请求加入队列。

只允许以下顺序的upgrade, 不能方向upgrade.

```c++
/**   
* While upgrading, only the following transitions should be allowed:
*        IS -> [S, X, IX, SIX]
*        S -> [X, SIX]
*        IX -> [X, SIX]
*        SIX -> [X]
*/
```

2.创建出LockRequest加入该表的锁请求队列LockRequestQueue中,upgrade的情况插入到队列第一个未被授予的请求的位置,因为upgrade要比其他请求锁的优先级高,不然直接插入到尾部, FIFO。

3.尝试获得锁,当前请求在该表的请求队列的条件变量上(cv)等待, 检查该请求是否能被授予, 不能则一直等待.

条件变量与互斥锁配合使用。首先需要持有锁，并查看是否能够获取资源。这个锁与资源绑定，是用来保证资源的互斥访问。若暂时无法获取资源，则调用条件变量的 wait 函数, 持有的锁将自动**释放**，并且当前线程被挂起，以节省资源。线程会被阻塞在wait函数中, 允许有多个线程在 wait 同一个cv。

```c++
std::unique_lock<std::mutex> lock(latch);
while (!resource) {
    cv.wait(lock);
}
```

当其他线程的活动使得资源状态发生改变时，需要调用cv的 `notify_all()` 或者`notify_one()`函数。即

```cpp
// do something changing the state of resource...
cv.notify_all();
```

`notify_all()` 可以看作一次广播，会唤醒所有正在此条件变量上阻塞的线程。`notify_one()`则是唤醒一个阻塞在该cv上上的线程. 线程被唤醒后，其仍处于 wait 函数中。被唤醒的线程在 wait 函数中尝试获取 latch, 注意只有一个线程会获得锁。在成功获取 latch 后，退出 wait 函数，进入循环的判断条件，检查是否能获取资源。若仍不能获取资源，就继续进入 wait 阻塞，释放锁，挂起线程。若能获取资源，则退出循环。

也可以使用c++中`std::wait`的另一种重载方法 `wait(lock, pred)` ,

这里的谓词pred 为 true，则函数立即返回，并且不会解锁 lock。
如果 pred 为 false，则函数会解锁 lock 并阻塞当前线程，直到其他线程调用 notify_one() 或 notify_all() 来唤醒它。
唤醒后，它会重新获得 lock 并再次检查 pred，如果 pred 变为 true，则函数返回。

```c++
queue->cv_.wait(lock,
                  [&]() -> bool { return CouldLockRequestProceed(request, txn, queue, is_upgrade, already_abort); });
```

`CouldLockRequestProceed`检查该request能被授予

- 该锁请求是否是第一个未被授予的正在waiting的请求, 锁请求会以严格的 FIFO 顺序依次满足,不是则继续等待。

- 当前txn是第一个未被授予的,则判断该请求是否与之前已经被授予的锁兼容,不兼容则继续等待。

  兼容矩阵:

  ![image-20240603173600578](E:\db资料\database\P4 并发控制.assets\image-20240603173600578.png)

  都满足则授予该锁请求，并在该事务的lockset中加入对应的资源。

4.如果该txn在等待`CouldLockRequestProceed`的时候被终止,  原因可能是死锁检测中将其终止，也可能是外部的一些原因造成终止。因此需要检测是否处于 Aborted 状态将该请求移出该表的请求队列.

5.该请求成功被授予,通知其他wait在该cv上的其他线程

### Unlock

UnLockTable实现思路(UnLockRow同理)：

1.判断该UnlockRequest是否有效

首先确保事务确实持有它试图释放的锁，即查询该txn是否持有的锁是啥，在表上获得是啥锁，或者在row上获得的是啥锁。未持有锁则返回false，如果该txn要释放表上的锁必须确保它不是该LockRequestQueue上upgrading的事务，并且要确保该表中所有的row锁已经释放了。否则这个解锁请求是不对的。

无效则修改事务txn的状态为终止,并抛出异常

2.该UnlockRequest有效，根据该txn持有的锁和隔离级别更新事务的状态. 注意:如果是由upgrade释放锁不应该更改事务状态.

`REPEATABLE_READ`: Unlock S/X 锁应该将事务状态改为*SHRINKING*

`READ_COMMITTED`和`READ_UNCOMMITTED`: Unlock X锁应该将事务状态改为SHRINKING

3.从该表的LockRequestQueue中移除LockRequest,以及从事务的锁集合中移除表id

4.通知wait在该表的LockRequestQueue其他locktable线程, 如果是由upgrade释放锁不应该通知, 因为upgrade的锁请求要优先处理.

### Deadlock Detection

在阻塞过程中有可能会出现多个事务的循环等待，出现循环等待会造成死锁。在 Bustub 中我们采用一个 background Deadlock Detection 线程来定时检查当前是否出现死锁。

我们用 wait for 有向图来表示事务之间的等待关系。`t1->t2` 即代表 t1 事务正在等待 t2 事务释放资源。当 wait for 图中存在环时，即代表出现死锁，需要挑选事务终止以打破死锁。

我们并不需要时刻维护 wait for 图，而是在死锁检测线程被唤醒时，根据当前每个资源的请求队列构建 wait for 图，再通过 wait for 图判断是否存在死锁。当判断完成后，将丢弃当前 wait for 图。下次线程被唤醒时再重新构建。

最常见的有向图环检测算法包括 DFS 和拓扑排序。在这里我们选用 DFS 来进行环检测。构建 wait for 图时要保证搜索的确定性。始终从 tid 较小的节点开始搜索，在选择邻居时，也要优先搜索 tid 较小的邻居。所以可以使用一个`map<txn_id_t, std::set<txn_id_t>>`来表示waits_for图, 出边数组的方法.

构建 wait for 图的过程是，遍历 `table_lock_map` 和 `row_lock_map` 中所有的请求队列，对于每一个请求队列，再用一个二重循环将所有满足等待关系的一对 tid 加入 wait for 图的边集, 具体就是遍历请求队列, 如果一个请求是已经granted的则加入当前资源已经granted的事务id集合中, 如果一个请求是waiting的, 则遍历当前资源已经granted的事务id集合, 在waits_for图中添加一条waiting->holder的边。

然后DFS判断是否出现环，找到一个环，则终止环路径上最年轻的txn（tid 最大的事务），即将此事务的状态设为 Aborted。并且在请求队列中移除此事务，释放其持有的锁，终止其正在阻塞的请求，并调用 `cv_.notify_all()` 通知正在阻塞的相关事务。然后再在图中将指向这个txn事务的边去除，再进行下一次判断是否有环，因为可能出现多个环。没出现环了，说明现在不会死锁，在出现环时终止了一些txn的情况下需要通过所有的阻塞的线程。

### Concurrent Query Execution

这一部分需要我们将 transaction 应用到之前实现的算子中，以支持并发的查询。

需修改 `SeqScan`、`Insert` 和 `Delete` 三个算子。为什么其他的算子不需要修改？因为其他算子获取的 tuple 数据均为中间结果，并不是表中实际的数据。而这三个算子是需要与表中实际数据打交道的。其中 `Insert` 和 `Delete` 几乎完全一样，与 `SeqScan` 分别代表着写和读。

#### SeqScan

在给row上S锁之前，需要在其table level根据事务隔离级别上也上锁。

如果隔离级别是 `READ_UNCOMMITTED` 则无需加锁， 隔离级别为`READ_COMMITTED` 和`REPEATABLE_READ` 的情况下判断该txn是否已经在该表上获得了锁，没有则调用LM的LockTable请求锁，请求锁失败则将txn的状态设置为ABORTED并抛出异常。该加什么锁？直观上来说应该直接给表加 S 锁，但实际上会导致 MixedTest 用例失败。实际上需要给表加 IS 锁，再给行加 S 锁。

在 `Next()` 函数中，隔离级别为`READ_COMMITTED` 和`REPEATABLE_READ` 的情况下判断该行是否已经被Lock，如果没有则向LM申请LockRow。

这里注意：如果是`READ_COMMITTED` ，在获取了行锁访问数据后，锁需要立马释放。`REPEATABLE_READ` 下，在 Commit/Abort 时统一释放，无需手动释放。

在实现了 Predicate pushdown to SeqScan 之后，有没有可以给表直接加 S 锁的情况？有，当 SeqScan 算子中不存在 Predicate 时，即需要全表扫描时，或许可以直接给表加 S 锁，避免给所有行全部加上 S 锁。


### Insert & Delete

在 `Next()` 函数中，插入之前，还没有获得IX锁，则为表加上 IX 锁。同样，若获取失败则抛 `ExecutionException` 异常。

在InsertTuple真正插入数据到表中时，再获取行锁。其他事务是看不见这一个row直到事务提交时。

锁在 Commit/Abort 时统一释放，无需手动释放。

