import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  mono?: boolean;
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  mono,
}: FieldProps) {
  return (
    <div>
      {label && (
        <Label
          className="block mb-1.5 font-bold uppercase"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--color-fg-mid)",
            letterSpacing: "var(--tracking-label)",
          }}
        >
          {label}
        </Label>
      )}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={mono ? "font-[family-name:var(--font-mono)]" : ""}
      />
    </div>
  );
}
