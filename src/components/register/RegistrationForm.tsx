"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { type z } from "zod";
import {
  registrationSchema,
  positionValues,
  POSITION_LABELS,
  MAX_PER_POSITION,
  type RegistrationFormData,
} from "@/lib/validators/registration";

// Zod input type（RHF 内部使用）vs output type（提交时使用）
type RegistrationInput = z.input<typeof registrationSchema>;
import { submitRegistration } from "@/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RegistrationFormProps {
  seasonId: string;
  seasonName: string;
  positionCounts: Record<string, number>;
}

export function RegistrationForm({
  seasonId,
  seasonName,
  positionCounts,
}: RegistrationFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // 第三个泛型参数：handleSubmit 回调收到 Zod 变换后的输出类型
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput, unknown, RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      seasonId,
      willingToBeCaptain: false,
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    const result = await submitRegistration(data);
    if (result.success) {
      setSubmittedEmail(data.email);
      setSubmitted(true);
    } else {
      if (result.error.fieldErrors) {
        toast.error("请检查表单填写");
      } else {
        toast.error(result.error.message);
      }
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-16 gap-4">
        <CheckCircle2 size={48} className="text-emerald-400" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">报名成功！</h2>
        <p className="text-[var(--text-secondary)] max-w-sm">
          已收到你的 <span className="font-medium text-[var(--text-primary)]">{seasonName}</span> 报名。
          一封登录链接已发送至
        </p>
        <p className="font-mono text-sm px-3 py-1.5 rounded-md bg-[var(--bg-overlay)] text-[var(--text-primary)]">
          {submittedEmail}
        </p>
        <p className="text-sm text-[var(--text-muted)] max-w-xs">
          管理员审核通过后会另行通知。你可以随时用邮件中的链接登录查看进度。
        </p>
      </div>
    );
  }

  const FieldError = ({ name }: { name: keyof RegistrationFormData }) =>
    errors[name] ? (
      <p className="text-xs text-red-400 mt-1">{errors[name]?.message as string}</p>
    ) : null;

  const positionFull = (pos: string) =>
    (positionCounts[pos] ?? 0) >= MAX_PER_POSITION;

  const positionLabel = (pos: string) => {
    const p = POSITION_LABELS[pos as keyof typeof POSITION_LABELS];
    const count = positionCounts[pos] ?? 0;
    const full = count >= MAX_PER_POSITION;
    return `${p.cn} (${p.en})  ${full ? "已满" : `${count}/${MAX_PER_POSITION}`}`;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <input type="hidden" {...register("seasonId")} />

      {/* 基本信息 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)]">
          基本信息
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-[var(--text-secondary)] mb-1.5 block">
              电子邮件 <span className="text-red-400">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              className="bg-[var(--bg-overlay)] border-[var(--border)]"
              {...register("email")}
            />
            <FieldError name="email" />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              用于接收登录链接和审核通知
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="steam64" className="text-[var(--text-secondary)] mb-1.5 block">
                Steam64 ID
              </Label>
              <Input
                id="steam64"
                placeholder="76561198XXXXXXXXX"
                className="bg-[var(--bg-overlay)] border-[var(--border)] font-mono text-sm"
                {...register("steam64")}
              />
              <FieldError name="steam64" />
            </div>
            <div>
              <Label htmlFor="qq" className="text-[var(--text-secondary)] mb-1.5 block">
                QQ 号
              </Label>
              <Input
                id="qq"
                placeholder="123456789"
                className="bg-[var(--bg-overlay)] border-[var(--border)]"
                {...register("qq")}
              />
              <FieldError name="qq" />
            </div>
          </div>
        </div>
      </section>

      {/* 位置与水平 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)]">
          位置与水平
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-[var(--text-secondary)] mb-1.5 block">
                主要位置 <span className="text-red-400">*</span>
              </Label>
              <Select
                onValueChange={(v) =>
                  setValue("primaryPosition", v as RegistrationFormData["primaryPosition"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="bg-[var(--bg-overlay)] border-[var(--border)]">
                  <SelectValue placeholder="选择主要位置" />
                </SelectTrigger>
                <SelectContent>
                  {positionValues.map((pos) => (
                    <SelectItem key={pos} value={pos} disabled={positionFull(pos)}>
                      {positionLabel(pos)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError name="primaryPosition" />
            </div>

            <div>
              <Label className="text-[var(--text-secondary)] mb-1.5 block">
                次要位置
              </Label>
              <Select
                onValueChange={(v) =>
                  setValue("secondaryPosition", v as RegistrationFormData["primaryPosition"])
                }
              >
                <SelectTrigger className="bg-[var(--bg-overlay)] border-[var(--border)]">
                  <SelectValue placeholder="选择次要位置（可选）" />
                </SelectTrigger>
                <SelectContent>
                  {positionValues.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {POSITION_LABELS[pos].cn} ({POSITION_LABELS[pos].en})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="peakRating" className="text-[var(--text-secondary)] mb-1.5 block">
              Premier 最高分
            </Label>
            <Input
              id="peakRating"
              type="number"
              placeholder="如：14500"
              min={0}
              max={50000}
              className="bg-[var(--bg-overlay)] border-[var(--border)]"
              {...register("peakRating", {
                setValueAs: (v) =>
                  v === "" || v === undefined || v === null ? undefined : parseInt(String(v), 10),
              })}
            />
            <FieldError name="peakRating" />
          </div>

          <div>
            <Label htmlFor="screenshotUrl" className="text-[var(--text-secondary)] mb-1.5 block">
              天梯截图链接
            </Label>
            <Input
              id="screenshotUrl"
              type="url"
              placeholder="https://..."
              className="bg-[var(--bg-overlay)] border-[var(--border)]"
              {...register("screenshotUrl")}
            />
            <FieldError name="screenshotUrl" />
            <p className="text-xs text-[var(--text-muted)] mt-1">
              建议上传至图床（如 njubox）后粘贴链接
            </p>
          </div>
        </div>
      </section>

      {/* 其他 */}
      <section>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--border)]">
          其他
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <input
              id="willingToBeCaptain"
              type="checkbox"
              className="mt-0.5 h-4 w-4 accent-[var(--season-primary)]"
              {...register("willingToBeCaptain")}
            />
            <div>
              <Label
                htmlFor="willingToBeCaptain"
                className="text-[var(--text-primary)] cursor-pointer"
              >
                我愿意参与队长竞选
              </Label>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                勾选后将出现在队长投票候选人列表中
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-[var(--text-secondary)] mb-1.5 block">
              备注
            </Label>
            <Textarea
              id="notes"
              rows={3}
              placeholder="时间冲突、特殊情况等可在此说明…"
              className="bg-[var(--bg-overlay)] border-[var(--border)] resize-none"
              {...register("notes")}
            />
            <div className="flex justify-between mt-1">
              <FieldError name="notes" />
              <span className="text-xs text-[var(--text-muted)] ml-auto">
                {watch("notes")?.length ?? 0}/500
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 反作弊承诺 */}
      <section className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-start gap-3">
          <input
            id="antiCheatPledge"
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-amber-400"
            onChange={(e) =>
              setValue("antiCheatPledge", e.target.checked as true, {
                shouldValidate: true,
              })
            }
          />
          <div>
            <Label
              htmlFor="antiCheatPledge"
              className="text-[var(--text-primary)] cursor-pointer font-medium"
            >
              反作弊承诺 <span className="text-red-400">*</span>
            </Label>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              我承诺在参赛期间不使用任何作弊软件或外挂。一经发现，接受取消资格处理。
            </p>
          </div>
        </div>
        <FieldError name="antiCheatPledge" />
      </section>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 text-base font-semibold"
        style={{
          backgroundColor: "var(--season-primary)",
          color: "#fff",
        }}
      >
        {isSubmitting ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            提交中…
          </>
        ) : (
          "提交报名"
        )}
      </Button>
    </form>
  );
}
