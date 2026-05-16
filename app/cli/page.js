"use client";

import { useEffect, useState } from "react";
import "./cli.css";

const SPINNER_FRAMES = ["◌", "○", "◎", "●", "◎", "○"];
const SPINNER_COLORS = ["#22c55e", "#f59e0b", "#22c55e", "#ef4444", "#facc15"];

function Timer() {
  const [s, setS] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setS((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return <>({m > 0 ? `${m}m ${rem}s` : `${rem}s`})</>;
}

function Spinner({ className = "" }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 180);
    return () => clearInterval(id);
  }, []);
  const frame = SPINNER_FRAMES[tick % SPINNER_FRAMES.length];
  const rotation = Math.floor(tick / SPINNER_FRAMES.length);
  const color = SPINNER_COLORS[rotation % SPINNER_COLORS.length];
  return (
    <span className={"t-spinner " + className} style={{ color }}>
      {frame}
    </span>
  );
}

const LOGO_LINES = [
  "─ ▬▬▬▬▬▬▬ ─────",
  "──── ▬▬▬▬▬▬ ───",
  "── ▬▬▬▬▬▬ ─────",
  "─ ▬▬▬ ── ▬▬▬ ──",
];

function Logo() {
  return (
    <>
      {LOGO_LINES.map((line, li) => (
        <div key={li} className="t-logo-line">
          {Array.from(line).map((ch, ci) => {
            if (ch === "▬") {
              return (
                <span key={ci} className="t-logo-green">
                  {ch}
                </span>
              );
            }
            if (ch === "─") {
              return (
                <span key={ci} className="t-logo-dim">
                  {ch}
                </span>
              );
            }
            return <span key={ci}>{ch}</span>;
          })}
        </div>
      ))}
    </>
  );
}

function Header() {
  return (
    <div className="t-header">
      <div className="t-logo" aria-hidden="true">
        <Logo />
      </div>
      <div className="t-title-block">
        <div className="t-title">Restless</div>
        <div className="t-subtitle">npx api init</div>
      </div>
    </div>
  );
}

const screens = [
  {
    title: "npx api init",
    body: (
      <>
        <Header />

        <p className="t-line">
          Restless makes sure every{" "}
          <span className="t-dot t-red">●</span>{" "}
          <span className="t-red">400 Bad Request</span> turns out{" "}
          <span className="t-dot t-green">●</span>{" "}
          <span className="t-green">200 Okay</span>.
        </p>

        <p className="t-line">
          It&apos;s not just another observability platform (although you can
          use it
          <br />
          to see what your users are up to!).
        </p>

        <p className="t-line">
          Think of us more as an API success platform. We give humans, AI and
          <br />
          you the tools to quickly make successful calls.
        </p>

        <p className="t-line t-orange t-bold">
          Ready to supercharge your API?
        </p>

        <div className="t-button">
          <span className="t-green">▸ Press ENTER to get started</span>
        </div>

        <p className="t-line t-muted">
          We use AI for the setup, but we&apos;ll ask permission before we do
          anything.
          <br />
          Press <span className="t-key">[d]</span> to try this on a demo repo ·
          Press <span className="t-key">[h]</span> to set up time with a human
        </p>
      </>
    ),
  },
  {
    title: "npx api init",
    body: (
      <>
        <Header />

        <ul className="t-steps">
          <li className="t-step">
            <div className="t-step-title">
              <span className="t-step-bullet">○</span> Step 1: Map out APIs
            </div>
          </li>
          <li className="t-step">
            <div className="t-step-title">
              <span className="t-step-bullet">○</span> Step 2: Install SDK
            </div>
          </li>
          <li className="t-step">
            <div className="t-step-title">
              <span className="t-step-bullet">○</span> Step 3: Test your setup
            </div>
          </li>
          <li className="t-step">
            <div className="t-step-title">
              <span className="t-step-bullet">○</span> Step 4: Set up account
            </div>
          </li>
        </ul>

        <p className="t-line t-muted">
          Setup runs locally through your own Claude or Codex install, so we
          never
          <br />
          see your code. We&apos;ll ask before uploading anything to our
          servers.
        </p>

        <p className="t-line t-bold t-prompt">
          How would you like to set this up?
        </p>

        <ul className="t-menu">
          <li className="t-menu-item t-menu-selected">
            <div className="t-menu-title">
              <span className="t-menu-arrow">›</span>
              <span className="t-menu-num">1.</span>
              <span className="t-bold">Claude</span>
              <span className="t-menu-meta"> (Recommended)</span>
            </div>
            <div className="t-menu-desc">
              Use Claude Code running locally on your machine.
            </div>
          </li>
          <li className="t-menu-item">
            <div className="t-menu-title">
              <span className="t-menu-arrow" />
              <span className="t-menu-num">2.</span>
              <span>Codex</span>
            </div>
            <div className="t-menu-desc">
              Codex isn&apos;t installed - we&apos;ll show you how.
            </div>
          </li>
          <li className="t-menu-item">
            <div className="t-menu-title">
              <span className="t-menu-arrow" />
              <span className="t-menu-num">3.</span>
              <span>Manual install</span>
            </div>
            <div className="t-menu-desc">
              We&apos;ll book a quick call so we can pair on it together.
            </div>
          </li>
          <li className="t-menu-item">
            <div className="t-menu-title">
              <span className="t-menu-arrow" />
              <span className="t-menu-num">4.</span>
              <span>Learn more</span>
            </div>
            <div className="t-menu-desc">
              Read about how setup works and what we touch before deciding.
            </div>
          </li>
        </ul>

        <span className="t-cursor" aria-hidden="true" />
      </>
    ),
  },
  {
    title: "npx api init",
    body: (
      <>
        <div className="t-header t-header-plan">
          <div className="t-logo" aria-hidden="true">
            <Logo />
          </div>
          <ul className="t-plan">
            <li className="t-plan-item">
              <span className="t-plan-arrow t-orange">›</span>{" "}
              <span className="t-orange t-bold">Step 1: Map out APIs</span>
            </li>
            <li className="t-plan-sub t-muted">
              <span className="t-plan-bullet">○</span> Locate APIs
            </li>
            <li className="t-plan-sub t-muted">
              <span className="t-plan-bullet">○</span> Generate OAS file
            </li>
            <li className="t-plan-sub t-muted">
              <span className="t-plan-bullet">○</span> Write to .restless/
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 2: Install SDK</span>
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 3: Test your setup</span>
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 4: Set up account</span>
            </li>
          </ul>
        </div>

        <hr className="t-rule" />

        <p className="t-section-heading t-orange t-bold">
          ─ Step 1: Map your API ─
        </p>

        <p className="t-line">Alright, let&apos;s map out your API.</p>

        <p className="t-line">
          <span className="t-bold">Why:</span> An OAS file is the shape of your
          API, every endpoint, parameter,
          <br />
          and response. Later steps use it to install the right adapter and
          wire up
          <br />
          the middleware exactly.
        </p>

        <p className="t-line">
          <span className="t-bold">What we&apos;ll do:</span> Point{" "}
          <span className="t-cyan">Claude Code</span> (running locally on your
          machine) at
          <br />
          your codebase, find your routes, and write an OAS file. It lands in
          a new
          <br />
          <span className="t-bold">.restless/</span> folder, commit that along
          with your code, it&apos;s meant to live there.
        </p>

        <p className="t-line">
          <span className="t-bold">Privacy:</span> Scanning runs entirely on
          your machine via your own <span className="t-cyan">Claude Code</span>
          <br />
          install. We don&apos;t see a single line of your code, and nothing
          gets sent to
          <br />
          our servers at this step.
        </p>

        <p className="t-line t-prompt-inline">
          <span className="t-bold">Ready to locate APIs?</span>{" "}
          <span className="t-muted">
            (press any key to continue, Ctrl-C to bail)
          </span>
          <span className="t-cursor-inline" aria-hidden="true" />
        </p>
      </>
    ),
  },
  {
    title: "npx api init",
    body: (
      <>
        <div className="t-header t-header-plan">
          <div className="t-logo" aria-hidden="true">
            <Logo />
          </div>
          <ul className="t-plan">
            <li className="t-plan-item">
              <span className="t-plan-arrow t-orange">›</span>{" "}
              <span className="t-orange t-bold">Step 1: Map out APIs</span>
            </li>
            <li className="t-plan-sub">
              <span className="t-plan-arrow">›</span> Locate APIs
            </li>
            <li className="t-plan-sub t-muted">
              <span className="t-plan-bullet">○</span> Generate OAS file
            </li>
            <li className="t-plan-sub t-muted">
              <span className="t-plan-bullet">○</span> Write to .restless/
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 2: Install SDK</span>
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 3: Test your setup</span>
            </li>
            <li className="t-plan-item">
              <span className="t-plan-bullet">○</span>{" "}
              <span className="t-bold">Step 4: Set up account</span>
            </li>
          </ul>
        </div>

        <hr className="t-rule" />

        <p className="t-line">
          We&apos;re looking through your code to find every endpoint and
          detect the framework.
        </p>

        <div className="t-task">
          <div className="t-task-title">
            <Spinner /> Reading files{" "}
            <span className="t-muted">
              <Timer />
            </span>
          </div>
          <div className="t-task-detail t-muted">
            Read /Users/gkoberger/Sites/restless/shipping-api/index.js
          </div>
        </div>

        <span className="t-cursor" aria-hidden="true" />
      </>
    ),
  },
  {
    title: "npx api init",
    body: (
      <>
        <div className="t-logs-head">
          <span className="t-bold">Logs</span>{" "}
          <span className="t-muted">(4 received)</span>
        </div>

        <ul className="t-log-list">
          <li className="t-log-row t-muted">
            <span className="t-log-dot">
              <Spinner className="t-muted-spinner" />
            </span>
            <span className="t-log-status">...</span>
            <span className="t-log-method">GET</span>
            <span className="t-log-path">/v1/account</span>
            <span className="t-log-extra">in flight...</span>
          </li>
          <li className="t-log-row">
            <span className="t-log-dot t-green">●</span>
            <span className="t-log-status t-green">200</span>
            <span className="t-log-method">GET</span>
            <span className="t-log-path">/v1/account</span>
          </li>
          <li className="t-log-row">
            <span className="t-log-dot t-green">●</span>
            <span className="t-log-status t-green">200</span>
            <span className="t-log-method">GET</span>
            <span className="t-log-path">/v1/account</span>
          </li>
          <li className="t-log-row">
            <span className="t-log-dot t-green">●</span>
            <span className="t-log-status t-green">200</span>
            <span className="t-log-method">GET</span>
            <span className="t-log-path">/v1/account</span>
          </li>
          <li className="t-log-row">
            <span className="t-log-dot t-green">●</span>
            <span className="t-log-status t-green">200</span>
            <span className="t-log-method">GET</span>
            <span className="t-log-path">/v1/account</span>
          </li>
        </ul>

        <p className="t-line t-green t-success">Congrats! It&apos;s working.</p>
        <p className="t-line t-muted">
          Press <span className="t-key t-bold">Tab</span> to continue the
          setup.
        </p>

        <div className="t-inset">
          <div className="t-inset-bar">
            <span className="terminal-dot terminal-dot-red" />
            <span className="terminal-dot terminal-dot-yellow" />
            <span className="terminal-dot terminal-dot-green" />
          </div>
          <div className="t-inset-cmd">
            <span className="t-muted">$</span> curl -i -sS
            http://localhost:3002/v1/account -H &quot;Authorization: Bearer
            demo_daria&quot;
            <span className="t-cursor-inline" aria-hidden="true" />
          </div>
          <hr className="t-inset-rule" />
          <pre className="t-inset-body">{`{
  "accountId": "usr_daria",
  "name": "Daria Steen"
}`}</pre>
        </div>
      </>
    ),
  },
  {
    title: "npx api init",
    body: (
      <>
        <div className="t-header t-header-plan">
          <div className="t-logo" aria-hidden="true">
            <Logo />
          </div>
          <ul className="t-plan">
            <li className="t-plan-item t-green">
              <span className="t-plan-bullet">✓</span> Step 1: Map out APIs
            </li>
            <li className="t-plan-item t-green">
              <span className="t-plan-bullet">✓</span> Step 2: Install SDK
            </li>
            <li className="t-plan-item t-green">
              <span className="t-plan-bullet">✓</span> Step 3: Test your setup
            </li>
            <li className="t-plan-item">
              <span className="t-plan-arrow t-orange">›</span>{" "}
              <span className="t-orange t-bold">Step 4: Set up account</span>
            </li>
            <li className="t-plan-sub t-green">
              <span className="t-plan-bullet">✓</span> Upload specs
            </li>
            <li className="t-plan-sub">
              <span className="t-plan-arrow">›</span> Log in
            </li>
          </ul>
        </div>

        <hr className="t-rule" />

        <p className="t-line">
          <span className="t-green">✓</span> Uploaded{" "}
          <span className="t-bold">.restless/openapi.json</span>.
        </p>

        <p className="t-line">
          Now log in to claim your project on Restless.
        </p>

        <p className="t-line t-link-row">
          <span className="t-cyan">
            https://app.restless.ai/login?token=a3f5d8e2c19b4670f8e3a7c52d910b4f
          </span>
        </p>

        <p className="t-line t-muted">
          Press Enter to open in your browser, or click the link above.
        </p>

        <span className="t-cursor" aria-hidden="true" />
      </>
    ),
  },
];

export default function CliPage() {
  const [index, setIndex] = useState(0);
  const total = screens.length;

  const go = (delta) => {
    setIndex((i) => (i + delta + total) % total);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const screen = screens[index];

  return (
    <main className="cli-page">
      <div className="cli-stage">
        <button
          className="cli-arrow cli-arrow-left"
          onClick={() => go(-1)}
          aria-label="Previous screen"
        >
          ‹
        </button>

        <div className="terminal">
          <div className="terminal-bar">
            <div className="terminal-dots">
              <span className="terminal-dot terminal-dot-red" />
              <span className="terminal-dot terminal-dot-yellow" />
              <span className="terminal-dot terminal-dot-green" />
            </div>
            <div className="terminal-bar-title">{screen.title}</div>
            <div className="terminal-bar-shortcut">⌥⌘7</div>
          </div>
          <div className="terminal-body">{screen.body}</div>
        </div>

        <button
          className="cli-arrow cli-arrow-right"
          onClick={() => go(1)}
          aria-label="Next screen"
        >
          ›
        </button>
      </div>

      <div className="cli-dots" role="tablist" aria-label="Screens">
        {screens.map((_, i) => (
          <button
            key={i}
            className={"cli-dot" + (i === index ? " cli-dot-active" : "")}
            onClick={() => setIndex(i)}
            aria-label={`Go to screen ${i + 1}`}
            aria-selected={i === index}
            role="tab"
          />
        ))}
      </div>

      <div className="cli-counter">
        {index + 1} / {total}
      </div>
    </main>
  );
}
