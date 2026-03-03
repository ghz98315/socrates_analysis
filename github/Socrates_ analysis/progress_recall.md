# Project Socrates - 开发节点回顾

> 本文档用于记录每日开发结束时的项目状态，便于下次直接读取并继续开发

---

## 最新节点: 2026-03-02 v1.6.21

### 当前状态
- **版本**: v1.6.21
- **分支**: main (socra-platform)
- **最后提交**: 登出重定向修复

### 已完成功能
1. ✅ 几何图形自动渲染 (JSXGraph)
2. ✅ 几何精确解析Prompt (100%匹配原题)
3. ✅ 几何镜像问题修复（Y轴坐标规则明确）
4. ✅ 几何条件自动提取（长度、角度、比例、平行、垂直等）
5. ✅ 几何图形保存（JSON+SVG双格式）
6. ✅ **自定义点功能已修复**（点击画板添加点，自动命名P1/P2）
7. ✅ 双栏布局（PC端左侧固定、移动端可折叠）
8. ✅ 变式题生成系统
9. ✅ 数学符号快捷输入
10. ✅ OCR符号输出规范（禁止LaTeX）
11. ✅ 社区功能
12. ✅ AI对话分析（家长端）
13. ✅ 辅助线绘制功能（手动添加虚线）
14. ✅ 直角自动识别标记
15. ✅ OCR识别范围界定（只识别题目文字，忽略界面元素和图形标记）
16. ✅ 反比例函数曲线绘制（y=k/x）
17. ✅ 函数方程条件提取
18. ✅ 几何条件传递到AI对话
19. ✅ AI模型调用调试日志
20. ✅ **Prompt System v2.0 - 三层架构**
21. ✅ **对话模式区分（Logic/Socra）**
22. ✅ **科目识别+题型识别**
23. ✅ **用户分层（免费/付费）**
24. ✅ **前端适配完成**（传递新参数+对话名称显示）
25. ✅ **科目/题型标签显示**（OCRResult 组件）
26. ✅ **几何坐标系统修复**（矩形从左下角开始顺时针排列）
27. ✅ **JSON解析增强**（处理Math.sqrt()表达式）
28. ✅ **坐标系三角形示例**（Rt△OAB类型）
29. ✅ **OCR显示区域优化**（字体缩小、自动高度调整）
30. ✅ **Prompt系统全面优化 v1.6.5**
    - 错误类型诊断框架（概念模糊/路径依赖/计算粗心）
    - 5 Whys根因分析法
    - MVP Hint（最小可行性提示）原则
    - 思维体检报告升级（SOP正确路径）
    - 变式训练三原则+难度递增
    - 错题归档提醒机制（3天复习+毕业）
31. ✅ **几何画板智能吸附 v1.6.6**
    - 拖动精度优化（0.1 → 0.05，更丝滑）
    - 点到线段自动吸附
    - 点与点之间的垂直/水平对齐吸附
    - 吸附阈值可配置（默认0.3）
32. ✅ **函数曲线可拖动 v1.6.7**
    - 反比例函数：可拖动中心点移动曲线 + k参数滑块
    - 一次函数：两点控制直线位置
    - 二次函数：顶点控制 + a参数滑块
    - 渐近线虚线显示
    - 动态方程标签
    - 画板尺寸扩大（400 → 500px）
    - 正方形画板（保持纵横比1:1）
33. ✅ **几何画板渲染修复 v1.6.8**
    - 修复线条丢失问题（调整渲染顺序：先点后线）
    - 禁用画板平移（防止意外移动）
    - 反比例函数控制点优化（O'移动曲线 + k调整形状）
34. ✅ **复习与成就系统逻辑修复 v1.6.9**
    - 添加连续学习天数更新逻辑（updateStreak函数）
    - 修复复习完成率计算（从0%硬编码改为动态计算）
    - 学习开始时自动触发连续学习成就检查
35. ✅ **成就解锁触发修复 v1.6.10**
    - 修复错题上传时不触发成就检查的问题
    - 在error-session创建成功后调用achievements API
    - 传递error_uploaded action和错题总数
36. ✅ **错题本加载性能优化 v1.6.11**
    - useMemo优化：filteredErrors、statusCounts避免重复计算
    - useCallback优化：fetchErrors函数
    - 搜索防抖：300ms延迟减少过滤操作
    - 移除重复的状态计数计算
37. ✅ **成就API调用URL修复 v1.6.13**
    - 修复服务端fetch需要绝对URL的问题
    - 添加VERCEL_URL作为fallback
    - 修复error-session、complete、study/session三个API
38. ✅ **成就系统基于数据库实际统计 v1.6.14**
    - 新增 getActualStats() 从数据库查询实际数量
    - error_uploaded：查询 error_sessions 表总数
    - error_mastered：查询 status='mastered' 的数量
    - review_completed：查询 is_completed=true 的数量
    - streak_updated：从 user_levels 获取 current_streak
    - 不再依赖传递的 count 参数，更可靠
39. ✅ **学习计时器闭包问题修复 v1.6.15**
    - 问题：isStudying 状态在定时器闭包中始终为初始值 false
    - 解决：添加 isStudyingRef 同步状态变化
    - 心跳正常工作，学习时长正确记录
40. ✅ **成就同步API + 最终修复 v1.6.16**
    - 新增 /api/achievements/sync 端点手动同步已有数据
    - 添加详细调试日志排查问题
    - 成就系统现在完全正常工作
41. ✅ **成就统计计算修复 v1.6.17**
    - 修复成就数量统计：过滤无效 achievement_id 并去重
    - 修复 XP 显示为 0：重新计算总 XP 基于实际解锁成就
    - 清理无效记录和重复记录
    - 修改文件：achievements/route.ts, achievements/sync/route.ts
42. ✅ **工作台添加待复习题目展示 v1.6.18**
    - 在工作台底部展示已到期的复习题目（最多5个）
    - 显示科目、标签、难度、复习进度
    - 点击可跳转到复习页面
    - 修改文件：workbench/page.tsx
43. ✅ **复习列表缓存优化 v1.6.19**
    - 新增 Zustand Store (`lib/stores/review-store.ts`)
    - 5分钟缓存机制（使用 sessionStorage）
    - 乐观更新：完成复习后立即更新 UI，无需等待数据库
    - 页面可见性监听：从复习页面返回时自动刷新
    - 避免重复 API 调用，性能大幅提升
    - 修改文件：review/page.tsx, lib/stores/review-store.ts
44. ✅ **成就系统 XP 自动同步 v1.6.20**
    - 自动检测 `user_levels.total_xp` 与实际成就积分是否一致
    - 如不一致，自动同步更新数据库
    - 添加详细日志记录无效/重复成就记录
    - 确保经验值和积分始终一致
    - 修改文件：api/achievements/route.ts
45. ✅ **登出重定向修复 v1.6.21**
    - 修复登出后停留在工作台页面的问题
    - AuthContext 使用 `window.location.href` 确保重定向
    - 工作台页面添加未登录自动重定向逻辑
    - 显示"正在跳转到登录页"提示
    - 修改文件：AuthContext.tsx, GlobalNav.tsx, workbench/page.tsx

### 待调试/优化
- ⏳ 几何调整后实时传递到对话
- ⏳ PDF导出功能
- ⏳ 家长通知系统（微信模板消息）
- ⏳ 几何图形渲染Infinity错误（反比例函数相关）

---

## 历史节点

### 2026-03-02 成就系统 XP 自动同步 (v1.6.20)

**问题描述**：
成就页面显示不一致：
- 经验值显示 0 XP（来自 `user_levels.total_xp`）
- 积分显示 55 XP（从实际解锁成就计算）
- 成就统计显示 3/19，但实际只显示 2 个

**问题原因**：
1. `user_levels.total_xp` 与实际解锁成就的积分不同步
2. 可能存在无效或重复的成就记录

**解决方案**：

**1. GET API 自动同步 XP**
```typescript
// 检查 user_levels.total_xp 是否与实际成就积分一致
const storedTotalXp = level?.total_xp || 0;
if (storedTotalXp !== earnedPoints) {
  // 自动同步：更新 user_levels.total_xp 为正确值
  await supabase
    .from('user_levels')
    .upsert({
      user_id,
      total_xp: earnedPoints,
      level: newLevelConfig.level,
      // ...
    });
}
```

**2. 详细日志记录**
```typescript
// 记录无效/重复记录
console.log('[Achievements GET] Data cleanup details:', {
  invalidCount: invalidRecords.length,
  invalidIds: invalidRecords.map(a => a.achievement_id),
  duplicateCount: duplicateRecords.length,
  duplicateIds: [...new Set(duplicateRecords.map(a => a.achievement_id))]
});
```

**修复效果**：
- ✅ 经验值和积分始终一致
- ✅ 自动修复历史数据不一致问题
- ✅ 详细日志便于排查问题

**修改文件**：
- `app/api/achievements/route.ts`

---

### 2026-03-02 复习列表缓存优化 (v1.6.19)

**问题描述**：
复习列表加载时间过长，每次复习完返回还需要重新加载整个列表，用户体验较差。

**问题原因**：
1. 每次进入复习页面都重新请求数据库
2. 完成复习后调用 `loadReviews()` 重新加载整个列表
3. 没有数据缓存机制

**解决方案**：

**1. 创建 Zustand Store**
```typescript
// lib/stores/review-store.ts
export const useReviewStore = create<ReviewStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      loading: false,
      lastFetched: null,

      setReviews: (reviews) => set({
        reviews,
        lastFetched: Date.now(),
      }),

      shouldRefetch: () => {
        const { lastFetched, loading } = get();
        if (loading) return false;
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_DURATION; // 5分钟
      },

      updateReviewStage: (reviewId, newStage) => set((state) => ({
        reviews: state.reviews.map(r =>
          r.id === reviewId ? { ...r, reviewStage: newStage } : r
        )
      })),
    }),
    {
      name: 'socrates-review-cache',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
```

**2. 乐观更新机制**
```typescript
// 完成复习时立即更新 UI，不等待数据库
const handleCompleteReview = async (reviewId: string) => {
  // 乐观更新 UI（立即反馈）
  updateReviewStage(reviewId, nextStage);

  // 后台更新数据库
  const { error } = await supabase
    .from('review_schedule')
    .update({ review_stage: nextStage })
    .eq('id', reviewId);

  if (error) {
    // 失败时回滚
    await loadReviews(true);
  }
};
```

**3. 页面可见性监听**
```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible' && profile?.id) {
      loadReviews(true); // 强制刷新
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [profile?.id, loadReviews]);
```

**性能提升**：
- ✅ 5分钟内返回页面使用缓存数据，无需重新请求
- ✅ 完成复习后即时 UI 反馈，无需等待
- ✅ 页面切换更流畅

**修改文件**：
- `lib/stores/review-store.ts` (新建)
- `app/(student)/review/page.tsx`

---

### 2026-03-02 成就系统基于数据库实际统计 (v1.6.14)

**问题描述**：
成就解锁依赖 API 调用时传递的 `count` 参数，而不是从数据库查询实际数量，可能导致成就无法正确解锁。

**修复方案**：
新增 `getActualStats()` 函数，从数据库查询实际统计数据：

```typescript
async function getActualStats(userId: string, action: string) {
  switch (action) {
    case 'error_uploaded':
      // 查询 error_sessions 表的总数
      const { count } = await supabase
        .from('error_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', userId);
      return { count };

    case 'error_mastered':
      // 查询 status='mastered' 的数量
      // ...

    case 'review_completed':
      // 查询 is_completed=true 的数量
      // ...

    case 'streak_updated':
      // 从 user_levels 获取 current_streak
      // ...
  }
}
```

**优势**：
- 基于数据库实际数据，更可靠
- 不依赖 API 调用时传递的参数
- 添加详细日志便于调试

**修改文件**：
- `app/api/achievements/route.ts`

---

### 2026-03-02 成就统计计算修复 (v1.6.17)

**问题描述**：
1. 解锁成就数量显示不正确（统计显示3个，实际只有2个）
2. 经验值显示为 0 XP

**问题原因**：
1. `user_achievements` 表可能包含无效的 achievement_id（不在 ACHIEVEMENTS 定义中）
2. 可能有重复的成就记录
3. `user_levels.total_xp` 与实际解锁成就的 XP 不一致

**修复方案**：

**1. GET API - 过滤和去重**
```typescript
// 过滤出有效的成就记录（achievement_id 存在于定义中）并去重
const validAchievementIds = new Set(ACHIEVEMENTS.map(a => a.id));
const uniqueUnlockedMap = new Map<string, UserAchievement>();
for (const a of unlocked) {
  if (validAchievementIds.has(a.achievement_id) && !uniqueUnlockedMap.has(a.achievement_id)) {
    uniqueUnlockedMap.set(a.achievement_id, a);
  }
}
const validUnlocked = Array.from(uniqueUnlockedMap.values());
```

**2. Sync API - 重新计算总 XP**
```typescript
// 计算正确的总 XP（基于所有有效成就）
const calculatedTotalXp = allUnlocked.reduce((sum, a) => {
  if (validAchievementIds.has(a.achievement_id)) {
    const def = ACHIEVEMENTS.find(d => d.id === a.achievement_id);
    return sum + (def?.points || 0);
  }
  return sum;
}, 0);
```

**3. Sync API - 清理无效/重复记录**
- 删除 achievement_id 不在定义中的记录
- 删除重复记录，保留最早的一条

**修改文件**：
- `app/api/achievements/route.ts`
- `app/api/achievements/sync/route.ts`

---

### 2026-03-02 学习计时器闭包问题修复 (v1.6.15)

**问题描述**：
学习界面上的计时器不工作，心跳没有发送，学习时长没有记录。

**问题原因**：
JavaScript 闭包问题 - `isStudying` 状态在定时器回调中被捕获为初始值 `false`，导致：
```typescript
// 问题代码
useEffect(() => {
  if (!isStudying) return; // 这里 isStudying 始终是 false

  const interval = setInterval(() => {
    if (isStudying) { // 这里也是 false
      sendHeartbeat();
    }
  }, 30000);
}, []);
```

**修复方案**：
使用 `useRef` 保持对状态的实时引用：
```typescript
const isStudyingRef = useRef(false);

// 在状态变化时同步到 ref
useEffect(() => {
  isStudyingRef.current = isStudying;
}, [isStudying]);

// 在定时器中使用 ref
const interval = setInterval(() => {
  if (isStudyingRef.current) {
    sendHeartbeat();
  }
}, 30000);
```

**修改文件**：
- `app/(student)/workbench/page.tsx`

---

### 2026-03-02 成就同步API + 最终修复 (v1.6.16)

**问题描述**：
用户已有 27 条错题数据，但成就没有解锁。需要手动同步历史数据。

**解决方案**：

**1. 新增同步 API**
创建 `/api/achievements/sync` 端点：
```typescript
// POST /api/achievements/sync
// 参数: { user_id: string }
// 返回: { stats, newlyUnlocked, xpGained }
```

**2. 同步逻辑**
- 查询用户实际统计数据（错题数、掌握数、复习数）
- 检查应该解锁的成就
- 插入新成就记录
- 更新 XP

**3. 调试日志**
添加详细日志排查成就未解锁原因：
```typescript
console.log('[Achievements Sync] Checking:', achievement.id, {
  alreadyUnlocked: unlockedIds.has(achievement.id),
  requirement: achievement.requirement,
  errorCount
});
```

**最终状态**：
- ✅ 成就系统完全正常工作
- ✅ 上传错题触发成就检查
- ✅ 掌握错题触发成就检查
- ✅ 学习计时器正常工作
- ✅ 心跳正常发送
- ✅ 学习时长正确记录

**修改文件**：
- `app/api/achievements/sync/route.ts` (新建)
- `app/api/achievements/route.ts`

---

### 2026-03-02 成就API调用URL修复 (v1.6.13)

**问题描述**：
上传错题后成就没有解锁，Vercel日志显示：
```
Failed to parse URL from /api/achievements
TypeError: Invalid URL
code: 'ERR_INVALID_URL'
```

**问题原因**：
服务端 `fetch()` 需要完整的绝对URL，但 `NEXT_PUBLIC_SITE_URL` 环境变量未设置，导致URL变成相对路径 `/api/achievements`。

**修复内容**：
```typescript
// 修复前
await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/achievements`, ...)

// 修复后
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
await fetch(`${baseUrl}/api/achievements`, ...)
```

**修改文件**：
- `app/api/error-session/route.ts` - 上传错题触发成就
- `app/api/error-session/complete/route.ts` - 掌握错题触发成就
- `app/api/study/session/route.ts` - 连续学习触发成就

---

### 2026-03-02 错题本加载性能优化 (v1.6.11)

**问题描述**：
错题本页面加载速度较慢，尤其是数据量增大时。

**问题原因**：
1. filteredErrors 每次渲染都重新计算（过滤+排序）
2. 状态计数在多处重复计算
3. 搜索输入没有防抖，每次按键都触发过滤

**优化内容**：

**1. useMemo 缓存计算结果**
```typescript
// 过滤和排序结果缓存
const filteredErrors = useMemo(() => {
  return errors.filter(...).sort(...);
}, [errors, debouncedSearch, selectedSubject, selectedStatus, sortBy]);

// 状态计数缓存
const statusCounts = useMemo(() => ({
  total: errors.length,
  analyzing: errors.filter(e => e.status === 'analyzing').length,
  guidedLearning: errors.filter(e => e.status === 'guided_learning').length,
  mastered: errors.filter(e => e.status === 'mastered').length,
}), [errors]);
```

**2. useCallback 缓存函数**
```typescript
const fetchErrors = useCallback(async () => {
  // ...
}, [profile?.id]);
```

**3. 搜索防抖 (300ms)**
```typescript
useEffect(() => {
  const timeout = setTimeout(() => {
    setDebouncedSearch(searchQuery);
  }, 300);
  return () => clearTimeout(timeout);
}, [searchQuery]);
```

**修改文件**：
- `app/(student)/error-book/page.tsx`

---

### 2026-03-02 成就解锁触发修复 (v1.6.10)

**问题描述**：
用户上传了多条错题，但"初学者"（上传第一道错题）等成就没有解锁。

**问题原因**：
`app/api/error-session/route.ts` 创建错题会话时没有调用 achievements API 触发成就检查。

**修复内容**：

在错题会话创建成功后，添加成就触发逻辑：
```typescript
// 获取该学生的错题总数，用于成就检查
const { count: errorCount } = await supabase
  .from('error_sessions')
  .select('*', { count: 'exact', head: true })
  .eq('student_id', student_id);

// 触发成就检查 - 上传错题
try {
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/achievements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: student_id,
      action: 'error_uploaded',
      data: { count: errorCount || 1 },
    }),
  });
} catch (e) {
  console.error('Failed to check upload achievements:', e);
}
```

**相关成就定义**：
- `first_error` - 上传1道错题（初学者）
- `error_collector_10` - 上传10道错题（错题收集家）
- `error_collector_50` - 上传50道错题（错题达人）
- `error_collector_100` - 上传100道错题（错题大师）

**修改文件**：
- `app/api/error-session/route.ts` - 添加成就触发逻辑

---

### 2026-03-02 复习与成就系统逻辑修复 (v1.6.9)

**问题分析**：

通过代码审查，1. **复习计划创建** - ✅ 已有逻辑（在 error-session/complete 中）
2. **成就触发机制** - ✅ 已有逻辑（调用 /api/achievements POST）
3. **连续学习天数** - ❌ 缺失更新逻辑
4. **完成率计算** - ❌ 硬编码为 0%

**修复内容**：

**1. 添加连续学习天数更新逻辑**
```typescript
// study/session/route.ts
async function updateStreak(userId: string) {
  // 获取当前streak
  // 计算日期差
  // 更新streak（连续+1， 断了重置为1）
  // 触发streak成就检查
}
```

**2. 修复复习完成率计算**
```typescript
// review/page.tsx
const completedCount = reviews.filter(r => r.reviewStage >= 5).length;
const completionRate = reviews.length > 0
  ? Math.round((completedCount / reviews.length) * 100)
  : 0;
```

**修改文件**：
- `app/api/study/session/route.ts` - 添加 updateStreak 函数
- `app/(student)/review/page.tsx` - 修复完成率计算

---

### 2026-03-02 几何画板渲染修复 + 函数曲线控制优化 (v1.6.8)

**修复内容**：

**1. 几何图形线条丢失问题**
- 原因：线段绘制在点创建之前，导致无法引用点元素
- 修复：调整渲染顺序 → 先创建点，再创建线段

**2. 画板意外移动问题**
- 禁用画板平移功能 `pan: { enabled: false }`

**3. 反比例函数控制优化**
- 红色 O' 点：拖动移动整个曲线位置
- 橙色 k 点：调整曲线形状参数 k
- 显示渐近线（灰色虚线）
- 动态方程标签

**修改文件**：
- `components/GeometryRenderer.tsx`

---

### 2026-03-02 函数曲线可拖动 + 画板扩大 (v1.6.7)

**优化内容**：

**1. 函数曲线可拖动**
- **反比例函数 (y=k/x)**
  - 添加红色中心控制点 O'，拖动可移动整个曲线
  - 橙色 k 参数点，调整曲线形状
  - 显示渐近线（虚线）
  - 动态方程标签：`y=k/(x-x0)+y0`

- **一次函数 (y=ax+b)**
  - 两点 P1、P2 控制直线位置
  - 动态计算斜率和截距

- **二次函数 (y=ax²+bx+c)**
  - 顶点 V 控制抛物线位置
  - a 参数点控制开口大小和方向
  - 动态顶点式方程标签

**2. 画板优化**
- 默认尺寸从 400px 扩大到 500px
- 边界计算优化：30% 边距 + 自适应范围
- 强制正方形（keepAspectRatio: true）
- 缩放控制优化

**修改文件**：
- `components/GeometryRenderer.tsx`

---

### 2026-03-02 几何画板智能吸附优化 (v1.6.6)

**优化内容**：

**1. 拖动精度优化**
- 网格吸附精度从 0.1 提升到 0.05
- 拖动更加丝滑流畅

**2. 点到线段自动吸附**
- 拖动点时自动检测到线段的距离
- 当距离小于阈值（0.3）时自动吸附到线段上
- 跳过以当前点为端点的线段

**3. 特殊关系自动吸附**
- 垂直对齐吸附：当点接近与其他点的垂直对齐时自动吸附
- 水平对齐吸附：当点接近与其他点的水平对齐时自动吸附
- 有助于绘制规整的几何图形

**4. 吸引器配置**
- 添加 `attractors` 配置实现点与点之间的自动吸引
- `attractorDistance: 0.3` 吸引距离
- `snatchDistance: 0.4` 抓取距离

**修改文件**：
- `components/GeometryRenderer.tsx` - 几何渲染组件

---

### 2026-03-02 Prompt系统全面优化 (v1.6.5)

**优化内容**：

**1. Layer 1 (base.ts) 通用层优化**
- 角色定义增强：添加"5 Whys根因分析"和"MVP Hint"概念
- 新增 `<error_diagnosis>` 错误类型诊断框架：
  - 概念模糊：对基本概念理解不清
  - 路径依赖：思路卡住，不知道下一步
  - 计算粗心：思路正确但计算出错
- MVP Hint原则：只给刚好能继续思考的最小提示
- 思维体检报告升级：
  ```
  📊 思维体检报告
  ├─ 错误类型：【概念模糊/路径依赖/计算粗心】
  ├─ 故障点：(思维断层位置)
  ├─ 5 Whys 归因分析：(层层追问找根因)
  └─ SOP 正确路径：(步骤化解法)
  ```
- Phase 5 巩固内化增强：
  - 变式训练三原则：逻辑相同、场景切换、难度递增
  - 错题归档提醒：3天复习 + 连续3次做对毕业

**2. Layer 2 (math.ts) 数学科目层优化**
- 小学策略：添加MVP Hint正确/错误示例
- 初中策略：新增策略五"5 Whys根因分析示例"
- 变式训练细化：
  - 第1题：仅换数字（验证基础掌握）
  - 第2题：换场景但结构相同（验证方法迁移）
  - 第3题：增加条件或步骤（验证深度理解）
- 新增对话示例：代数题展示完整5 Whys分析+思维体检报告

**修改文件**：
- `lib/prompts/base.ts` - 通用层优化
- `lib/prompts/subjects/math.ts` - 数学科目层优化

**参考文档**：
- `mathpromote.md` - 参考提示词（5 Whys、SOP、变式训练）

---

### 2026-02-28 添加点功能修复 + OCR优化 (v1.6.4)

**修复内容**：
1. 添加点功能完全修复
   - 使用 `board.mouse.usrCoords` 获取坐标
   - 添加手动坐标转换备选方案
   - 添加 `isFinite()` 坐标验证

2. TypeScript 类型修复
   - 为 `x, y, clientX, clientY` 添加显式类型声明

3. OCR显示区域优化
   - 字体从 `text-base` 改为 `text-sm`
   - 自动高度调整（根据内容动态扩展）
   - 最小高度从 180px 减少到 80px
   - 边距调整更紧凑

**修改文件**：
- `components/GeometryRenderer.tsx` - 坐标获取逻辑修复
- `components/OCRResult.tsx` - 显示区域样式优化

**Git提交**：
- `526ce06` - fix: Improve coordinate extraction for point adding
- `458d835` - fix: Add explicit type annotations for TypeScript
- `4523106` - style: Optimize OCR result display area

---

### 2026-02-28 几何解析增强 (v1.6.3)

**修复内容**：
1. JSON解析增强：自动计算 Math.sqrt() 表达式
2. 添加坐标系三角形示例（Rt△OAB类型）
3. 添加点功能：增加调试日志，改进坐标获取

**修改文件**：
- `app/api/geometry/route.ts` - JSON解析增强 + 新示例
- `components/GeometryRenderer.tsx` - 添加点事件调试

---

### 2026-02-28 几何坐标系统修复 (v1.6.2)

**问题描述**：
几何图形渲染后与原图方向不一致，矩形ABCD渲染后A出现在左上角，而原图A在左下角。

**问题原因**：
Geometry API 的 Prompt 中矩形顶点命名规则与初中数学课本习惯不一致

**修复后坐标规则**：
```
A = (-w/2, -h/2) 左下角，Y值最小
B = (w/2, -h/2)  右下角，Y值最小
C = (w/2, h/2)   右上角，Y值最大
D = (-w/2, h/2)  左上角，Y值最大
```

---

## 架构说明

### Prompt 三层架构
```
┌─────────────────────────────────────────────────────────┐
│                    System Prompt                         │
├─────────────────────────────────────────────────────────┤
│ Layer 1: 通用层（base.ts）                               │
│   - 角色定义（苏格拉底 + 20年教学经验）                   │
│   - 绝对红线（禁绝答案、严禁越界、拒绝预判、启发铁律）      │
│   - 通用工作流（四步法）                                  │
│   - 情绪抚慰话术                                         │
├─────────────────────────────────────────────────────────┤
│ Layer 2: 科目层（subjects/*.ts）                         │
│   - 科目特定策略（小学/初中不同策略）                      │
│   - 知识点库（按学段）                                   │
│   - Few-Shot 示例（按学段）                              │
├─────────────────────────────────────────────────────────┤
│ Layer 3: 动态层（builder.ts 运行时）                      │
│   - 当前题目内容                                         │
│   - 几何/图形数据                                        │
│   - 图片检测（触发复述确认）                              │
│   - 题型信息                                            │
└─────────────────────────────────────────────────────────┘
```

### 用户分层与对话模式
| 用户等级 | 科目识别 | 模式 | 对话显示名称 |
|---------|---------|------|-------------|
| free | 任意 | 通用模式 | **Logic** |
| premium | 成功(>0.7) | 专科模式 | **Socra** |
| premium | 失败 | 通用模式 | **Logic** |

### API 调用示例
```typescript
// Chat API 新增参数
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({
    message: '...',
    subject: 'math',           // 科目（来自OCR识别）
    userLevel: 'premium',      // 用户等级
    subjectConfidence: 0.92,   // 科目识别置信度
    grade: 'senior',           // 学段
    questionType: 'proof',     // 题型
    // ...
  }),
});

// 返回值新增 dialogMode
{
  "content": "...",
  "dialogMode": "Socra",       // 或 "Logic"
  "modelUsed": "qwen-plus"
}
```

---

## 快速启动提示词

复制以下内容到新的对话中继续开发：

```
我是 Project Socrates 项目的开发者。请阅读以下文件了解项目当前状态：

1. 读取 D:\github\Socrates_ analysis\progress_recall.md 了解最新节点
2. 读取 D:\github\Socrates_ analysis\PROGRESS.md 了解完整进度
3. 读取 D:\github\Socrates_ analysis\prd.md 了解产品需求
4. 读取 D:\github\Socrates_ analysis\mathprompt.md 了解Prompt设计

当前项目目录：
- 主项目：D:\github\Socrates_ analysis\socra-platform\apps\socrates
- 文档目录：D:\github\Socrates_ analysis

当前版本：v1.6.21
最后更新：登出重定向修复
Prompt架构：三层架构（通用层+科目层+动态层）

请确认已了解项目状态，我需要继续开发以下内容：
[在此填写具体需求]
```

---

## 历史节点

### 2026-02-28 Prompt System v2.0 + 对话模式区分 (v1.6.0)

**开发内容**：
1. **Prompt 三层架构重构**
   - Layer 1 通用层：角色定义、绝对红线、工作流、话术规范
   - Layer 2 科目层：按科目加载策略、知识点库、Few-Shot示例
   - Layer 3 动态层：题目内容、几何数据、图片检测

2. **对话模式区分**
   - Logic（通用模式）：免费用户或科目识别失败
   - Socra（专科模式）：付费用户 + 科目识别成功

3. **科目识别系统**
   - OCR 新增科目识别（math/chinese/english）
   - OCR 新增题型识别（choice/fill/solution/proof等）
   - 返回置信度，用于判断使用哪种模式

4. **科目配置模块化**
   - 数学配置完整实现（math.ts）
   - 语文/英语配置预留（chinese.ts, english.ts）
   - 通用模式配置（generic.ts）

5. **API 增强**
   - Chat API：新增 subject、userLevel、dialogMode 等参数
   - OCR API：新增科目识别、题型识别

**新增文件**：
- lib/prompts/types.ts
- lib/prompts/base.ts
- lib/prompts/builder.ts
- lib/prompts/index.ts
- lib/prompts/subjects/index.ts
- lib/prompts/subjects/math.ts
- lib/prompts/subjects/chinese.ts
- lib/prompts/subjects/english.ts
- lib/prompts/subjects/generic.ts

**待前端适配**：
- 传递 userLevel 参数（从用户信息获取）
- 传递 subject、subjectConfidence 参数（从OCR结果获取）
- 根据 dialogMode 显示对话名称

---

### 2026-02-28 苏格拉底提示词增强+AI调用调试 (v1.5.2)

**开发内容**：
1. 苏格拉底提示词全面增强
   - 添加【知识引导策略】：引导学生回忆公式/定理
   - 添加【渐进式引导流程】五步法：读题→知识点回忆→建立联系→执行计算→反思总结
   - 小学生知识点库：运算、几何、应用题、分数百分数
   - 初中生知识点库：代数、函数、几何定理（三角形/四边形/圆/比例）
   - 提问技巧示例（好的问法 vs 不好的问法）

2. 几何数据传递到AI对话
   - Chat API传递完整几何条件（长度、角度、比例、函数等）
   - 系统提示词中包含几何图形信息

3. 自定义点功能修复
   - 使用JSXGraph原生事件 `board.on('down')` 替代React onClick

4. AI模型调用调试
   - 添加详细日志：模型选择、API Key状态、响应状态
   - 响应中返回 `modelUsed` 字段方便调试

**Git提交**：
- `6239191` - fix: Add detailed logging for AI model calling debugging
- `655afab` - feat: Enhance Socratic prompt with knowledge point guidance
- `90cc3ec` - fix: Enhance geometry data passing to AI chat and fix point adding
- `53a47bf` - fix: Fix custom point adding using JSXGraph native events

---

### 2026-02-28 OCR优化+反比例函数支持 (v1.5.1)

**开发内容**：
1. OCR识别范围优化
   - 明确识别范围界定：只识别题目文字部分
   - 忽略界面元素（按钮、标签等）
   - 忽略图形上的标记字母
   - 添加识别截止点规则

2. 反比例函数曲线支持
   - 添加CurveData接口支持函数曲线
   - 支持 inverse_proportional (y=k/x) 类型
   - 同时绘制正负两个分支
   - 显示函数方程标签

3. 函数方程条件提取
   - 添加 functions 条件类型
   - 提取"y=k/x"、"函数经过点X"等条件
   - 在已知条件区域显示函数方程

**Git提交**：
- `b2f400f` - feat: Add OCR boundary control and inverse proportional function support

---

### 2026-02-28 几何+UI全面优化 (v1.5.0)

**开发内容**：
1. 自定义点功能
   - 添加点模式（点击图板任意位置）
   - 自动命名（P1、P2...）
   - 点可拖动
   - 可与现有点连接画辅助线

2. 几何保存格式优化
   - 同时保存JSON数据（可编辑）和SVG图片（视觉一致）
   - 添加GeometryRendererRef暴露getSVGContent方法
   - 更新error_session API支持geometry_data和geometry_svg
   - 创建数据库迁移文件add-geometry-columns.sql

3. 删除标注按钮
   - 移除OCRResult中的ImageAnnotator相关代码
   - 保留几何图板中的辅助线绘制功能

4. 双栏布局
   - PC端：左侧固定（40%），右侧滚动（60%）
   - 移动端：可折叠左侧面板+横屏提示
   - 添加移动端检测和切换按钮

**Git提交**：
- `6609db5` - feat: Implement 4 geometry and UI improvements

---

### 2026-02-28 几何条件提取+镜像修复 (v1.4.2)

**开发内容**：
- 修复几何图形Y轴镜像问题（明确坐标规则：上方点Y值大）
- 添加全面的几何关系识别（垂直、平行、相交、相切、全等、相似等）
- 添加条件自动提取功能

**Git提交**：
- `5e6f80c` - feat: Fix geometry mirror issue and add comprehensive conditions extraction

---

### 2026-02-28 几何精确解析 (v1.4.1)

**开发内容**：
- 完全重写几何解析Prompt，确保100%匹配原题要求
- 添加精确坐标计算规则
- 辅助线手动绘制功能（橙色虚线）

**Git提交**：
- `fe3f413` - feat: Completely rewrite geometry parsing prompt for 100% accuracy

---

### 2026-02-28 几何图形渲染 (v1.4.0)

**开发内容**：
- 创建 GeometryRenderer 组件（JSXGraph）
- 创建 /api/geometry 解析API
- 修复 SSR window 未定义错误

**Git提交**：
- `a38df8d` - feat: Add geometry auto-rendering with JSXGraph

---

### 2026-02-28 变式题系统 (v1.3.0)

**开发内容**：
- 创建 variant_questions 和 variant_practice_logs 表
- 完善 /api/variants API

**Git提交**：
- `30cb886` - feat: Complete variant questions system with database support

---

### 2026-02-28 OCR符号规范 (v1.2.x)

**开发内容**：
- 完善OCR prompt，添加初中数学符号输出规范
- 禁止LaTeX格式输出

**Git提交**：
- `0800442` - feat: Complete middle school math symbol guide for OCR

---

## 下一步开发方向

### P0 - 高优先级
1. **验证AI模型调用** - 确认三层Prompt是否正常工作
2. **添加用户订阅字段** - profiles 表添加 subscription_tier 字段
3. **测试完整流程** - OCR识别 → 科目识别 → 对话模式切换

### P1 - 中优先级
4. **语文/英语配置完善** - 完善知识点库和Few-Shot示例
5. **社区功能完善** - 积分、徽章、排行榜
6. **学习数据分析** - 知识点掌握度可视化

---

## 常用命令

```bash
# 进入项目目录
cd "D:\github\Socrates_ analysis\socra-platform\apps\socrates"

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建检查
pnpm build

# TypeScript检查
npx tsc --noEmit

# Git操作
git push origin main
```

---

## 环境变量清单

在 Vercel 和本地 .env 中需要配置：

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI服务 - 通义千问（对话和OCR）
DASHSCOPE_API_KEY=          # 通义千问 API Key（对话+OCR）
AI_API_KEY_VISION=          # 通义千问 VL (OCR，可选)
AI_API_KEY_LOGIC=           # DeepSeek (可选)

# 站点配置
NEXT_PUBLIC_SITE_URL=https://socrates.socra.cn
```

**重要**：确保 Vercel 中配置了 `DASHSCOPE_API_KEY`，否则对话会回退到 mock 模式。

---

*文档最后更新: 2026-03-02 v1.6.21*
