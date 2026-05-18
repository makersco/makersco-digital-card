#!/usr/bin/env python3
"""
shared_card.py — Core utilities for MakersCo Digital Business Card Platform.

Model architecture:
  Opus 4.7  → planning, spec writing, creative decisions
  Sonnet    → HTML building (cheaper, excellent at code)
  qwen3:8b  → last resort fallback if both CLI models unavailable

Token resume tracker:
  - Writes checkpoint after every completed step
  - Detects daily token reset (date change in checkpoint)
  - Resumes from last in_progress step on next run
  - Never loses work to token exhaustion
"""
from __future__ import annotations
import os, sys, json, datetime, re, subprocess, time
import requests

# ── Models ────────────────────────────────────────────────────────────────────
OPUS_MODEL   = "claude-opus-4-7"
SONNET_MODEL = "claude-sonnet-4-5"
LOCAL_MODEL  = "qwen3:8b"  # fallback only

# ── Token Budgets (daily Pro plan safe limits) ────────────────────────────────
OPUS_DAILY_LIMIT   = 80_000    # planning + specs
SONNET_DAILY_LIMIT = 200_000   # HTML building

# ── Checkpoint & Token Files ──────────────────────────────────────────────────
TODAY = datetime.date.today().isoformat()
CHECKPOINT_FILE   = "/tmp/makersco_card_checkpoint.json"
OPUS_TOKEN_FILE   = f"/tmp/makersco_card_opus_{TODAY}.txt"
SONNET_TOKEN_FILE = f"/tmp/makersco_card_sonnet_{TODAY}.txt"

# ── Project paths ─────────────────────────────────────────────────────────────
PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR     = os.path.join(PROJECT_DIR, "src")


# ══════════════════════════════════════════════════════════════════════════════
# TOKEN TRACKING
# ══════════════════════════════════════════════════════════════════════════════

def _read_tokens(filepath: str) -> int:
    try:
        if os.path.exists(filepath):
            return int(open(filepath).read().strip())
    except Exception:
        pass
    return 0

def _add_tokens(filepath: str, n: int) -> int:
    total = _read_tokens(filepath) + n
    with open(filepath, "w") as f:
        f.write(str(total))
    return total

def opus_tokens_used()   -> int: return _read_tokens(OPUS_TOKEN_FILE)
def sonnet_tokens_used() -> int: return _read_tokens(SONNET_TOKEN_FILE)

def opus_budget_ok() -> bool:
    used = opus_tokens_used()
    pct  = used / OPUS_DAILY_LIMIT * 100
    print(f"  📊 Opus:   {used:>7,}/{OPUS_DAILY_LIMIT:,} tokens ({pct:.1f}%)")
    return used < OPUS_DAILY_LIMIT

def sonnet_budget_ok() -> bool:
    used = sonnet_tokens_used()
    pct  = used / SONNET_DAILY_LIMIT * 100
    print(f"  📊 Sonnet: {used:>7,}/{SONNET_DAILY_LIMIT:,} tokens ({pct:.1f}%)")
    return used < SONNET_DAILY_LIMIT

def print_token_status():
    print(f"\n  {'─'*50}")
    opus_budget_ok()
    sonnet_budget_ok()
    print(f"  {'─'*50}\n")


# ══════════════════════════════════════════════════════════════════════════════
# CHECKPOINT / RESUME SYSTEM
# ══════════════════════════════════════════════════════════════════════════════

def _load_checkpoint() -> dict:
    if os.path.exists(CHECKPOINT_FILE):
        try:
            data = json.loads(open(CHECKPOINT_FILE).read())
            # If date changed → token counts reset, keep completed steps
            if data.get("date") != TODAY:
                print(f"  🔄 New day detected — token counts reset. Completed steps preserved.")
                data["date"]                = TODAY
                data["opus_tokens_today"]   = 0
                data["sonnet_tokens_today"] = 0
            return data
        except Exception:
            pass
    return {
        "date": TODAY,
        "completed": [],
        "in_progress": None,
        "in_progress_step": None,
        "opus_tokens_today": 0,
        "sonnet_tokens_today": 0,
        "last_updated": None,
    }

def _save_checkpoint(cp: dict):
    cp["date"]                = TODAY
    cp["opus_tokens_today"]   = opus_tokens_used()
    cp["sonnet_tokens_today"] = sonnet_tokens_used()
    cp["last_updated"]        = datetime.datetime.now().isoformat()
    with open(CHECKPOINT_FILE, "w") as f:
        json.dump(cp, f, indent=2)

def is_step_done(step_key: str) -> bool:
    cp = _load_checkpoint()
    done = step_key in cp.get("completed", [])
    if done:
        print(f"  ⏭️  Skipping '{step_key}' — already completed")
    return done

def mark_step_started(step_key: str, sub_step: str = None):
    cp = _load_checkpoint()
    cp["in_progress"]      = step_key
    cp["in_progress_step"] = sub_step
    _save_checkpoint(cp)
    print(f"  🔧 Started: {step_key}" + (f" → {sub_step}" if sub_step else ""))

def mark_step_done(step_key: str):
    cp = _load_checkpoint()
    if step_key not in cp["completed"]:
        cp["completed"].append(step_key)
    cp["in_progress"]      = None
    cp["in_progress_step"] = None
    _save_checkpoint(cp)
    print(f"  ✅ Completed: {step_key}")

def show_progress():
    cp = _load_checkpoint()
    done = cp.get("completed", [])
    print(f"\n  📋 Progress: {len(done)} steps completed: {done or 'none yet'}")
    if cp.get("in_progress"):
        print(f"  🔧 In progress: {cp['in_progress']}")


# ══════════════════════════════════════════════════════════════════════════════
# LLM CLIENTS
# ══════════════════════════════════════════════════════════════════════════════

_SYSTEM = (
    "Output ONLY raw HTML/JSON/code. No explanations. No markdown fences. "
    "Start with the very first character of content."
)

def _call_claude_cli(prompt: str, model: str, timeout: int = 300) -> str | None:
    """Call Claude via CLI (uses Pro plan — no API cost)."""
    try:
        result = subprocess.run(
            ["claude", "-p", prompt, "--model", model, "--output-format", "text"],
            capture_output=True, text=True, timeout=timeout,
        )
        out = result.stdout.strip()
        if out:
            return out
        err = result.stderr.strip()[:300]
        print(f"  [warn] {model} CLI empty: {err}")
    except FileNotFoundError:
        print(f"  [warn] 'claude' CLI not found")
    except subprocess.TimeoutExpired:
        print(f"  [warn] {model} timed out after {timeout}s")
    except Exception as e:
        print(f"  [warn] {model} error: {e}")
    return None

def _call_qwen(prompt: str, timeout: int = 300) -> str | None:
    """Last-resort fallback: local Ollama qwen3:8b."""
    try:
        r = requests.post(
            "http://localhost:11434/api/generate",
            json={"model": LOCAL_MODEL, "prompt": _SYSTEM + "\n\n" + prompt, "stream": False},
            timeout=timeout,
        )
        if r.status_code == 200:
            text = r.json().get("response", "").strip()
            text = re.sub(r"^```[a-z]*\n?", "", text)
            text = re.sub(r"\n?```$",       "", text)
            return text if text else None
    except Exception as e:
        print(f"  [warn] Qwen fallback failed: {e}")
    return None


def ask_opus(prompt: str, timeout: int = 180) -> str:
    """
    Call Opus 4.7 for planning and spec writing.
    Falls back to Sonnet if Opus budget exhausted.
    Falls back to Qwen if both exhausted.
    """
    if not opus_budget_ok():
        print("  ⚠️  Opus budget exhausted — using Sonnet for this planning call")
        return ask_sonnet(prompt, timeout=timeout)

    est_in = len(prompt) // 4
    out = _call_claude_cli(prompt, OPUS_MODEL, timeout)
    if out:
        est_out = len(out) // 4
        total = _add_tokens(OPUS_TOKEN_FILE, est_in + est_out)
        print(f"  🧠 Opus used ~{est_in+est_out:,} tokens (today: {total:,})")
        return out

    print("  [warn] Opus CLI failed — falling back to Sonnet")
    return ask_sonnet(prompt, timeout=timeout)


def ask_sonnet(prompt: str, timeout: int = 300) -> str:
    """
    Call Sonnet for HTML building.
    Falls back to Qwen if Sonnet budget exhausted or CLI unavailable.
    """
    if not sonnet_budget_ok():
        print("  ⚠️  Sonnet budget exhausted — using Qwen fallback")
        return _call_qwen(prompt, timeout) or ""

    est_in = len(prompt) // 4
    out = _call_claude_cli(prompt, SONNET_MODEL, timeout)
    if out:
        # Strip fences if Sonnet adds them
        out = re.sub(r"^```[a-z]*\n?", "", out.strip())
        out = re.sub(r"\n?```$",       "", out)
        est_out = len(out) // 4
        total = _add_tokens(SONNET_TOKEN_FILE, est_in + est_out)
        print(f"  ✨ Sonnet used ~{est_in+est_out:,} tokens (today: {total:,})")
        return out

    print("  [warn] Sonnet CLI failed — falling back to Qwen")
    return _call_qwen(prompt, timeout) or ""


def build_html(prompt: str, min_chars: int = 3000, timeout: int = 300) -> str | None:
    """
    Build HTML using Sonnet. If output too short, retry once.
    If Sonnet budget gone, uses Qwen.
    Returns None only if everything fails.
    """
    print(f"  ✨ Sonnet building HTML...")
    html = ask_sonnet(prompt, timeout=timeout)
    if html and len(html) >= min_chars:
        print(f"  ✅ HTML built ({len(html):,} chars)")
        return html
    if html:
        print(f"  ⚠️  HTML too short ({len(html):,} chars) — retrying once...")
        retry_prompt = (
            "IMPORTANT: Your previous response was incomplete. "
            "Build the FULL complete HTML now. Do not truncate anything.\n\n"
            + prompt
        )
        html = ask_sonnet(retry_prompt, timeout=timeout)
        if html and len(html) >= min_chars:
            print(f"  ✅ HTML built on retry ({len(html):,} chars)")
            return html
    print(f"  ❌ HTML build failed (final size: {len(html) if html else 0} chars)")
    return html if html else None


# ══════════════════════════════════════════════════════════════════════════════
# FILE HELPERS
# ══════════════════════════════════════════════════════════════════════════════

def write_src(relative_path: str, content: str) -> str:
    """Write a file to the src/ directory. Returns absolute path."""
    full_path = os.path.join(SRC_DIR, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  💾 Wrote: src/{relative_path} ({len(content):,} chars)")
    return full_path

def write_project(relative_path: str, content: str) -> str:
    """Write a file to the project root directory."""
    full_path = os.path.join(PROJECT_DIR, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  💾 Wrote: {relative_path} ({len(content):,} chars)")
    return full_path


# ══════════════════════════════════════════════════════════════════════════════
# DESIGN PRINCIPLES (injected into every Opus planning prompt)
# ══════════════════════════════════════════════════════════════════════════════

DESIGN_PRINCIPLES = """
DESIGN RULES — non-negotiable:
- No Inter as default font (use Geist, Outfit, Space Grotesk, DM Sans, Satoshi)
- No pure #000000 background (use #0a0a0f, #111827, #0b0f1a)
- No neon colors — accent saturation below 80%
- Only animate transform + opacity (GPU-safe, no top/left/width/height)
- All transitions under 300ms for interactions
- Card faces: position:absolute; top:0; left:0; width:100%; height:100% (mandatory)
- No fabricated metrics or AI clichés ("Seamless", "Elevate", "99.9% uptime")
- No emoji in UI headings
- Font weights: 300 (light) / 400 (body) / 600 (label) / 700 (heading) / 800 (hero)
- Spacing on 4px or 8px grid — all gaps/padding multiples of 4
- Status/tag badges: border-radius:20px; padding:2px 10px; font-weight:700
- Mobile-first: min touch targets 44px, responsive at 380px and 768px
"""


# ══════════════════════════════════════════════════════════════════════════════
# ENVIRONMENT CHECK
# ══════════════════════════════════════════════════════════════════════════════

def check_env():
    """Verify Claude CLI is available. Warn if local model is missing."""
    errors = []

    # Check Claude CLI
    try:
        r = subprocess.run(
            ["claude", "--version"],
            capture_output=True, text=True, timeout=10,
        )
        if r.returncode == 0:
            print(f"  ✅ Claude CLI: {r.stdout.strip()[:50]}")
        else:
            errors.append("'claude' CLI not responding correctly. Run: claude --version")
    except FileNotFoundError:
        errors.append("'claude' CLI not found. Install Claude Code first.")

    # Check Ollama (optional, just warn)
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=3)
        models = [m["name"] for m in r.json().get("models", [])]
        local_ok = any(LOCAL_MODEL.split(":")[0] in m for m in models)
        if local_ok:
            print(f"  ✅ Ollama: {LOCAL_MODEL} ready (fallback available)")
        else:
            print(f"  ⚠️  Ollama: {LOCAL_MODEL} not found (Sonnet will handle building)")
    except Exception:
        print(f"  ⚠️  Ollama not running (Sonnet will handle building — that's fine)")

    if errors:
        print("\n🚫 Environment issues:")
        for e in errors:
            print(f"   • {e}")
        sys.exit(1)

    show_progress()
    print(f"  📅 Today: {TODAY}")
    print(f"  📁 Project: {PROJECT_DIR}")
