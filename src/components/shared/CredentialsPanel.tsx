"use client";

import { useState } from "react";
import { MdContentCopy, MdCheck } from "react-icons/md";
import type { GeneratedCredentials } from "@/types/credentials";
import Button from "@/components/ui/Button";
import Alert from "@/components/ui/Alert";

/**
 * One-time credentials reveal panel — used after creating (or resetting)
 * a login for a Brand Admin, Showroom Admin, or Employee.
 */
export default function CredentialsPanel({
  credentials,
  onDone,
}: {
  credentials: GeneratedCredentials;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCredentials = async () => {
    const text = `Login: ${credentials.loginEmail}\nTemporary password: ${credentials.temporaryPassword}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — the person can still select the text manually.
    }
  };

  return (
    <div className="space-y-5">
      <Alert variant="success">
        {credentials.accountLabel} — login created. Share the details below with them securely.
      </Alert>

      <div className="space-y-3 rounded-xl border border-border bg-surface-tint p-4">
        <div>
          <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">
            Login email
          </p>
          <p className="font-mono text-sm text-ink">{credentials.loginEmail}</p>
        </div>
        <div>
          <p className="text-caption font-medium uppercase tracking-wide text-ink-muted">
            Temporary password
          </p>
          <p className="font-mono text-sm text-ink">{credentials.temporaryPassword}</p>
        </div>
      </div>

      <p className="text-caption text-ink-muted">
        This password is shown only once and isn&apos;t stored anywhere you can view again — copy
        it now. Share it through a secure channel (not plain-text email). They&apos;ll be
        required to set their own password the first time they sign in.
      </p>

      <div className="flex flex-col gap-2.5 sm:flex-row">
        <Button type="button" variant="outline" onClick={copyCredentials} className="sm:flex-1">
          {copied ? (
            <>
              <MdCheck size={17} /> Copied
            </>
          ) : (
            <>
              <MdContentCopy size={17} /> Copy credentials
            </>
          )}
        </Button>
        <Button type="button" onClick={onDone} className="sm:flex-1">
          Done
        </Button>
      </div>
    </div>
  );
}
