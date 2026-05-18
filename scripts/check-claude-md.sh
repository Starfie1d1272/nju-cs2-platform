#!/bin/zsh
# 校验 CLAUDE.md 组件清单是否与实际文件一致
# 以磁盘文件为真实来源，检查每个 .tsx 组件名是否在 CLAUDE.md 中有记录。
# 同时匹配 kebab-case（header-client）和 PascalCase（HeaderClient），
# 覆盖两种文档风格，无需维护硬编码列表。
# 用法: zsh scripts/check-claude-md.sh
set -euo pipefail

ROOT=$(dirname "$0")/..
CLAUDE_MD="$ROOT/CLAUDE.md"
errors=0

# kebab-case / lowercase → PascalCase（用字符串拼接，避免 OFS 空格问题）
to_pascal() {
  echo "$1" | awk -F'-' '{r=""; for(i=1;i<=NF;i++) r=r toupper(substr($i,1,1)) substr($i,2); print r}'
}

# ui/ 目录为 shadcn 按需组件，不纳入校验
DIRS=(layout rivalhub matches admin draft captains teams register settings)

echo "Checking CLAUDE.md against src/components/..."

for dir in "${DIRS[@]}"; do
  echo "$dir/"
  files=($(ls "$ROOT/src/components/$dir/"*.tsx 2>/dev/null | xargs -n1 basename | sed 's/\.tsx$//' || true))
  for name in "${files[@]}"; do
    pascal=$(to_pascal "$name")
    # 原始文件名（kebab/lower）或 PascalCase 任一出现在 CLAUDE.md 即视为已记录
    if ! grep -qi "$name" "$CLAUDE_MD" && ! grep -qi "$pascal" "$CLAUDE_MD"; then
      echo "  MISSING in CLAUDE.md (exists on disk): src/components/$dir/$name.tsx"
      errors=$((errors + 1))
    fi
  done
done

echo ""
if [ $errors -eq 0 ]; then
  echo "✅ CLAUDE.md 组件清单与实际文件一致"
  exit 0
else
  echo "❌ 发现 $errors 处不一致，请更新 CLAUDE.md"
  exit 1
fi
