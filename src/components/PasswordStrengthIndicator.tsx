import { useMemo } from "react";
import { Check, X } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export function getPasswordStrength(password: string): {
  score: number;
  requirements: Requirement[];
} {
  const requirements: Requirement[] = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  const score = requirements.filter((r) => r.met).length;
  return { score, requirements };
}

export function isPasswordStrong(password: string): boolean {
  const { score } = getPasswordStrength(password);
  return score >= 4; // Require at least 4 out of 5 requirements
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { score, requirements } = useMemo(
    () => getPasswordStrength(password),
    [password]
  );

  const getStrengthLabel = () => {
    if (score === 0) return "";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score === 4) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (score <= 2) return "bg-destructive";
    if (score <= 3) return "bg-yellow-500";
    if (score === 4) return "bg-green-500";
    return "bg-green-600";
  };

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          <span
            className={
              score <= 2
                ? "text-destructive"
                : score <= 3
                ? "text-yellow-500"
                : "text-green-500"
            }
          >
            {getStrengthLabel()}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {requirements.map((req) => (
          <li
            key={req.label}
            className={`flex items-center gap-2 text-xs transition-colors ${
              req.met ? "text-green-500" : "text-muted-foreground"
            }`}
          >
            {req.met ? (
              <Check className="w-3 h-3" />
            ) : (
              <X className="w-3 h-3" />
            )}
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
