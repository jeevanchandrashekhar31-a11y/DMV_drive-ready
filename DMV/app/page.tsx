"use client";

import { lazy, Suspense, useState } from "react";
import { toast } from "sonner";
import StateSelector from "@/components/driveready/StateSelector";
import Dashboard from "@/components/driveready/Dashboard";
import PracticeMode from "@/components/driveready/PracticeMode";
import BottomTabBar, { Tab } from "@/components/driveready/BottomTabBar";
import { Toaster } from "@/components/ui/sonner";
import { loadProgress } from "@/lib/store/progress";

type Screen = "state-selector" | "app";

const ExamMode = lazy(() => import("@/components/driveready/ExamMode"));
const ProgressTracker = lazy(() => import("@/components/driveready/ProgressTracker"));

function TabLoading() {
  return (
    <div className="flex h-full items-center justify-center" style={{ background: "#0A0A1B" }}>
      <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "rgba(79,142,247,0.2)" }} />
    </div>
  );
}

export default function DriveReadyApp() {
  const [screen, setScreen] = useState<Screen>("state-selector");
  const [selectedState, setSelectedState] = useState<{ abbr: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [practiceTopic, setPracticeTopic] = useState<string | undefined>(undefined);

  function handleStateContinue(state: { abbr: string; name: string }) {
    loadProgress(state.abbr);
    setSelectedState(state);
    setPracticeTopic(undefined);
    setActiveTab("home");
    setScreen("app");
    toast(`Switching to ${state.name}...`);
  }

  function handlePracticeWeakTopic(topic: string) {
    setPracticeTopic(topic);
    setActiveTab("practice");
  }

  function renderTabContent() {
    switch (activeTab) {
      case "home":
        return (
          <Dashboard
            stateCode={selectedState?.abbr ?? "CA"}
            stateName={selectedState?.name ?? "California"}
            onPractice={() => {
              setPracticeTopic(undefined);
              setActiveTab("practice");
            }}
            onExam={() => setActiveTab("exam")}
            onPracticeWeakTopic={handlePracticeWeakTopic}
          />
        );
      case "practice":
        return <PracticeMode stateCode={selectedState?.abbr ?? "CA"} topic={practiceTopic} />;
      case "exam":
        return (
          <Suspense fallback={<TabLoading />}>
            <ExamMode
              stateCode={selectedState?.abbr ?? "CA"}
              onComplete={() => setActiveTab("progress")}
            />
          </Suspense>
        );
      case "progress":
        return (
          <Suspense fallback={<TabLoading />}>
            <ProgressTracker
              stateCode={selectedState?.abbr ?? "CA"}
              onPracticeWeakTopic={handlePracticeWeakTopic}
              onReset={() => setPracticeTopic(undefined)}
            />
          </Suspense>
        );
      default:
        return null;
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#050510" }}
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 600px 400px at 50% 40%, rgba(79,142,247,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Phone frame */}
      <div
        className="relative flex flex-col overflow-hidden shadow-2xl"
        style={{
          width: "390px",
          height: "844px",
          borderRadius: "44px",
          background: "#0A0A1B",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05) inset",
        }}
      >
        {/* Status bar */}
        <div
          className="flex items-center justify-between px-8 py-2 flex-shrink-0"
          style={{ height: "44px" }}
        >
          <span className="text-[13px] font-semibold text-white">9:41</span>
          <div
            className="absolute left-1/2 -translate-x-1/2 rounded-full"
            style={{ width: "120px", height: "34px", background: "#000", top: 0 }}
          />
          <div className="flex items-center gap-1.5">
            {/* Signal */}
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
              <rect x="0" y="7" width="3" height="5" rx="0.5" fill="white" />
              <rect x="4.5" y="4.5" width="3" height="7.5" rx="0.5" fill="white" />
              <rect x="9" y="2" width="3" height="10" rx="0.5" fill="white" />
              <rect x="13.5" y="0" width="2.5" height="12" rx="0.5" fill="white" opacity="0.3" />
            </svg>
            {/* WiFi */}
            <svg width="16" height="12" viewBox="0 0 24 18" fill="none">
              <path d="M1 6.5C5 2.5 10 0.5 12 0.5C14 0.5 19 2.5 23 6.5" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              <path d="M4 10C6.5 7.5 9.5 6 12 6C14.5 6 17.5 7.5 20 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
              <path d="M8 13.5C9.5 12 11 11 12 11C13 11 14.5 12 16 13.5" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="12" cy="17" r="1.5" fill="white" />
            </svg>
            {/* Battery */}
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
              <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="white" strokeOpacity="0.35" />
              <rect x="1.5" y="1.5" width="17" height="9" rx="2" fill="white" />
              <path d="M23 4v4a2 2 0 0 0 0-4z" fill="white" fillOpacity="0.4" />
            </svg>
          </div>
        </div>

        {/* Screen content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {screen === "state-selector" ? (
            <StateSelector onContinue={handleStateContinue} />
          ) : (
            <>
              <div className="flex-1 overflow-hidden">
                {renderTabContent()}
              </div>
              <BottomTabBar active={activeTab} onChange={setActiveTab} />
            </>
          )}
        </div>

        {/* Home indicator */}
        <div className="flex justify-center pb-2 flex-shrink-0">
          <div className="w-32 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }} />
        </div>
      </div>

      <Toaster position="top-center" richColors />

    </div>
  );
}
