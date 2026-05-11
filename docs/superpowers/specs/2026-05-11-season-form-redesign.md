# 赛季创建表单重构

## 日期
2026-05-11

## 目标
重构 `/admin/seasons/new` 表单，以队伍报名 + Major 赛制为默认，按报名模式差异化显示字段，改进 UX。

## 1. 顶部预设下拉

表单最上方加一个下拉菜单，选择预设后一键填充所有默认值：

```
预设: [Major 公开赛 ▾]
      ├ Major 公开赛
      └ Rivals 选秀联赛
```

| 字段 | Major 预设 | Rivals 预设 |
|------|-----------|------------|
| kind | "Major" | "选秀联赛" |
| registrationMode | team | solo |
| teamSize | 9 | 7 |
| starterCount | 5 | 5 |
| hasCaptainVoting | false | false（默认不勾） |
| hasDraft | false | false（默认不勾） |
| positions | []（隐藏） | igl,awper,opener,closer,anchor |
| stagePlan | MAJOR_STAGE_PLAN | RIVALS_STAGE_PLAN |
| registrationConfig | {}（隐藏） | RIVALS_REGISTRATION_CONFIG |

选完预设后可以手动修改任意字段。

## 2. 基础信息

| 字段 | 改动 |
|------|------|
| 名称 `name` | 输入后自动生成 slug（中文→拼音→kebab-case） |
| Slug `slug` | 自动填充 + 说明 "URL 路径标识，留空自动生成"；创建后锁定 |
| 类型 `kind` | 文本，跟随预设 |
| 主题色 `themeColor` | 6 色块点击选择（#f97316 / #3b82f6 / #22c55e / #8b5cf6 / #ef4444 / #14b8a6）+ 可自定义 hex 输入 |
| 开始/结束时间 | datetime-local，加大输入框 |

### Slug 自动生成规则
- 输入 "2026 NJU Major" → `2026-nju-major`
- 输入 "2026 NJU Rivals 春季赛" → `2026-nju-rivals-chun-ji-sai`
- 中文用 pinyin-pro 或简化规则转换
- 用户可覆盖手写

## 3. Capability（按报名模式差异化）

### Team 模式（Major 默认）

```
┌─ 报名模式: [队伍报名 ▾] ─────────────────┐
│                                             │
│  每队人数上限: [9]                           │
│  首发人数:     [5]                           │
│                                             │
│  (队长投票、蛇形选秀、位置列表隐藏)         │
└─────────────────────────────────────────────┘
```

### Solo 模式（Rivals 默认）

```
┌─ 报名模式: [个人报名 ▾] ─────────────────┐
│                                             │
│  位置列表: [igl,awper,opener,closer,anchor] │
│  每队人数: [7]                              │
│  首发人数: [5]                              │
│  ☐ 队长投票                                  │
│  ☐ 蛇形选秀                                  │
└─────────────────────────────────────────────┘
```

切换报名模式时自动设置隐藏字段的默认值（投票/选秀→false）。

## 4. 报名配置（仅 Solo 显示）

Team 模式整块隐藏（队伍报名不涉及段位门槛、位置名额、截图）。

| 字段 | 值 | 说明 |
|------|------|------|
| 允许选手类型 | 多选：在校/毕业/外校 | 勾选哪些身份可报名 |
| 当前段位门槛 | 下拉 | 本赛季段位不低于此 |
| 历史段位门槛 | 下拉 | 历史最高段位不低于此 |
| 每位置上限 | 数字 | 每位置最多报名人数 |
| 截图数量 | 数字 | 报名需上传几张截图 |

## 5. 赛制配置

下拉选择预设 + 可视化展示 + 自定义 JSON：

```
赛制: [Major 32队 ▾]
      ├ Major 32队    → 3轮瑞士轮 BO1 → 单败淘汰 BO3(决赛BO5)
      ├ Rivals 8队    → 单循环 BO1 → 双败淘汰 BO3
      └ 自定义 JSON   → 展开编辑器
```

选自定义时显示**带注释的 JSON 编辑区**：

```json
[
  {
    "key": "stage1",           // 阶段唯一标识（英文）
    "name": "阶段一",          // 展示名称（中文）
    "type": "swiss",           // 赛制: round_robin | single_elim | double_elim | swiss | gsl_group
    "teamCount": 16,           // 参赛队伍数
    "matchFormat": "bo1",      // 比赛 BO 数: bo1 | bo3 | bo5
    "advanceTiers": [
      { "placement": "*", "count": 8 }  // "*"=全部晋级 / "1st"=冠军 / "2nd"=亚军
    ],
    "seeds": null,             // [可选] 种子队编号，null=按 draft_order 自动取前 teamCount
    "entrySeeds": null,        // [可选] 直入本阶段种子数（非首阶段使用）
    "finalFormat": null,       // [可选] 决赛 BO 覆写，仅淘汰赛阶段生效
    "groupCount": 1,           // [可选] 分组数，swiss/gsl 使用
    "hasThirdPlaceMatch": false // [可选] 三四名决赛
  }
]
```

## 6. 暂不涉及（后续单独做）

- **弹性队伍人数**：Major 预设 teamSize=9，但队伍报名支持 5-9 人灵活添加/删除队员。需要在 schema 加 `minTeamSize` + 队伍管理页面。
- 后端校验逻辑变更
- DB schema 变更
- 赛制 executor 修改
