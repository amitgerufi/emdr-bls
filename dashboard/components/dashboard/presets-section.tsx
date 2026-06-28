"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import {
  deletePreset,
  listPresets,
  savePreset,
  type PresetSettings,
  type SessionPreset,
} from "@/lib/presets";

interface PresetsSectionProps {
  uid: string;
  currentSettings: () => PresetSettings;
  onApply: (settings: PresetSettings) => void;
}

export function PresetsSection({ uid, currentSettings, onApply }: PresetsSectionProps) {
  const { t } = useLanguage();
  const [presets, setPresets] = useState<SessionPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listPresets(uid)
      .then(setPresets)
      .catch(() => toast.error(t("presetsLoadFailed")))
      .finally(() => setLoading(false));
  }, [uid, t]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSaving(true);
    try {
      const settings = currentSettings();
      const id = await savePreset(uid, trimmed, settings);
      setPresets((prev) => [{ id, name: trimmed, settings, createdAt: null }, ...prev]);
      setName("");
      toast.success(t("presetSaved"));
    } catch {
      toast.error(t("presetSaveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePreset(uid, id);
      setPresets((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error(t("presetDeleteFailed"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          placeholder={t("presetNamePlaceholder")}
          autoComplete="off"
        />
        <Button type="button" onClick={handleSave} disabled={!name.trim() || saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {t("save")}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">{t("loadingPresets")}</p>
      ) : presets.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noPresetsYet")}</p>
      ) : (
        <ul className="space-y-2">
          {presets.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border bg-secondary/60 px-3 py-2.5"
            >
              <button type="button" onClick={() => onApply(p.settings)} className="flex-1 text-start text-sm font-semibold">
                {p.name}
              </button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDelete(p.id)}
                aria-label={t("deletePreset")}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
