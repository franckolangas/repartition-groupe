'use client';

import { useState, useEffect, useTransition } from "react";
import { ParticipantsInput } from "@/components/ParticipantsInput";
import { GroupNumberInput } from "@/components/GroupNumberInput";
import { ShuffleButton } from "@/components/ShuffleButton";
import { GroupsGrid } from "@/components/GroupsGrid";
import { ExportMenu } from "@/components/ExportMenu";
import { LeadersInput } from "@/components/LeadersInput";
import { StatsDashboard } from "@/components/StatsDashboard";
import { HistoryPanel, type HistoryItem } from "@/components/HistoryPanel";
import { generateGroups } from "./actions";
import { verifyDistribution, balanceGroups } from "@/lib/utils";
import { AlertCircle, History, Search } from "lucide-react";
import { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Participant } from "@/lib/types";

export default function Home() {
  const [participantsText, setParticipantsText] = useState("");
  const [leadersText, setLeadersText] = useState("");
  const [groupCount, setGroupCount] = useState(2);
  const [groups, setGroups] = useState<Participant[][]>([]);
  const [leaders, setLeaders] = useState<Record<number, string>>({});
  const [groupNames, setGroupNames] = useState<Record<number, string>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [columns, setColumns] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  // Load from local storage on mount
  useEffect(() => {
    const savedParticipants = localStorage.getItem("participantsText");
    const savedLeadersText = localStorage.getItem("leadersText");
    const savedGroupCount = localStorage.getItem("groupCount");
    const savedGroups = localStorage.getItem("groups");
    const savedLeaders = localStorage.getItem("leaders");
    const savedGroupNames = localStorage.getItem("groupNames");
    const savedHistory = localStorage.getItem("history");
    const savedColumns = localStorage.getItem("columns");

    if (savedParticipants) setParticipantsText(savedParticipants);
    if (savedLeadersText) setLeadersText(savedLeadersText);
    if (savedGroupCount) setGroupCount(parseInt(savedGroupCount));

    if (savedGroups) {
      // Migration check: if saved groups are strings, convert to objects
      const parsed = JSON.parse(savedGroups);
      if (parsed.length > 0 && parsed[0].length > 0 && typeof parsed[0][0] === 'string') {
        const migrated = parsed.map((g: string[]) => g.map((name: string) => ({ id: crypto.randomUUID(), name })));
        setGroups(migrated);
      } else {
        setGroups(parsed);
      }
    }

    if (savedLeaders) setLeaders(JSON.parse(savedLeaders));
    if (savedGroupNames) setGroupNames(JSON.parse(savedGroupNames));

    // History migration is tricky, maybe just clear it if incompatible?
    // Or parse and migrate on restore.
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    if (savedColumns) setColumns(parseInt(savedColumns));

    setMounted(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("participantsText", participantsText);
    localStorage.setItem("leadersText", leadersText);
    localStorage.setItem("groupCount", groupCount.toString());
    localStorage.setItem("groups", JSON.stringify(groups));
    localStorage.setItem("leaders", JSON.stringify(leaders));
    localStorage.setItem("groupNames", JSON.stringify(groupNames));
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("columns", columns.toString());
  }, [participantsText, leadersText, groupCount, groups, leaders, groupNames, history, columns, mounted]);

  const addToHistory = (newGroups: Participant[][], newLeaders: Record<number, string>, newGroupNames?: Record<number, string>) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      groups: newGroups, // Now Participant[][]
      leaders: newLeaders,
      groupNames: newGroupNames || groupNames,
      groupCount: newGroups.length,
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 20));
  };

  const handleRestore = (item: HistoryItem) => {
    // Check if item.groups contains strings (old format)
    let restoredGroups = item.groups as unknown as (string | Participant)[][];

    if (restoredGroups.length > 0 && restoredGroups[0].length > 0 && typeof restoredGroups[0][0] === 'string') {
      // Migrate old history item on the fly
      restoredGroups = restoredGroups.map(g => (g as unknown as string[]).map(name => ({ id: crypto.randomUUID(), name })));
    }

    setGroups(restoredGroups as Participant[][]);
    setLeaders(item.leaders);
    setGroupNames(item.groupNames || {});
    setGroupCount(item.groupCount);

    const allParticipants = (restoredGroups as Participant[][]).flat().map(p => p.name).join("\n");
    setParticipantsText(allParticipants);
  };

  const handleClearHistory = () => {
    if (confirm("Voulez-vous vraiment effacer tout l'historique ?")) {
      setHistory([]);
    }
  };

  const handleApplyLeaders = () => {
    const leadersList = leadersText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (leadersList.length === 0) return;

    setGroupCount(leadersList.length);

    const newLeaders: Record<number, string> = {};
    leadersList.forEach((leader, index) => {
      newLeaders[index] = leader;
    });
    setLeaders(newLeaders);

    // Optional: Reset groups if the count changes drastically?
    // For now, we just update the leaders and group count. 
    // The user will likely click Shuffle next.
  };

  const handleShuffle = () => {
    const participantList = participantsText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (participantList.length === 0) return;

    startTransition(async () => {
      // Generate objects with IDs first
      const participants = participantList.map(name => ({ id: crypto.randomUUID(), name }));

      const result = await generateGroups(participants, groupCount);

      // Verify distribution (needs update to handle objects)
      // We can map back to strings for verification or update verifyDistribution
      const verification = verifyDistribution(participantList, result.map(g => g.map(p => p.name)));
      if (!verification.valid) {
        setErrors(verification.errors);
      } else {
        setErrors([]);
      }

      setGroups(result);

      // Calculate new leaders
      const newLeaders: Record<number, string> = {};
      for (let i = 0; i < groupCount; i++) {
        if (leaders[i]) newLeaders[i] = leaders[i];
      }
      setLeaders(newLeaders);

      addToHistory(result, newLeaders);
    });
  };

  const handleLeaderChange = (index: number, value: string) => {
    setLeaders((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleAddParticipant = (groupIndex: number, name: string) => {
    setGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex] = [...newGroups[groupIndex], { id: crypto.randomUUID(), name }];
      return newGroups;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the containers
    const findContainer = (id: string) => {
      if (id.startsWith("group-")) return parseInt(id.replace("group-", ""));
      // Item ID is now the UUID. We need to find which group contains this UUID.
      return groups.findIndex(g => g.some(p => p.id === id));
    };

    const activeContainer = findContainer(activeId);
    let overContainer = findContainer(overId);

    // If overId is a group container
    if (overId.startsWith("group-")) {
      overContainer = parseInt(overId.replace("group-", ""));
    }

    if (activeContainer === -1 || overContainer === -1 || !groups[activeContainer] || !groups[overContainer]) {
      return;
    }

    if (activeContainer === overContainer) {
      // Same container reordering is handled in DragEnd usually, but DragOver can do it too.
      // For dnd-kit sortable, DragOver is mainly for moving between containers.
      return;
    }

    // Move item to the new container's state temporarily for visual feedback
    setGroups((prev) => {
      const activeItems = [...prev[activeContainer]];
      const overItems = [...prev[overContainer]];

      const activeIndex = activeItems.findIndex((p) => p.id === activeId);
      const overIndex = overItems.findIndex((p) => p.id === overId);

      let newIndex;
      if (overId.startsWith("group-")) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowOverItem =
          over &&
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height;

        const modifier = isBelowOverItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return prev.map((g, i) => {
        if (i === activeContainer) {
          return g.filter((p) => p.id !== activeId);
        }
        if (i === overContainer) {
          return [
            ...g.slice(0, newIndex),
            activeItems[activeIndex],
            ...g.slice(newIndex, g.length),
          ];
        }
        return g;
      });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const findContainer = (id: string) => {
      if (id.startsWith("group-")) return parseInt(id.replace("group-", ""));
      return groups.findIndex(g => g.some(p => p.id === id));
    };

    const activeContainer = findContainer(activeId);
    let overContainer = findContainer(overId);

    if (overId.startsWith("group-")) {
      overContainer = parseInt(overId.replace("group-", ""));
    }

    if (activeContainer !== -1 && overContainer !== -1 && activeContainer !== overContainer) {
      // Handled in DragOver
      addToHistory(groups, leaders);
    } else if (activeContainer !== -1 && activeContainer === overContainer) {
      // Reordering within the same group
      const activeIndex = groups[activeContainer].findIndex(p => p.id === activeId);
      const overIndex = groups[overContainer].findIndex(p => p.id === overId);

      if (activeIndex !== overIndex) {
        setGroups((prev) => {
          const newGroups = [...prev];
          newGroups[activeContainer] = arrayMove(prev[activeContainer], activeIndex, overIndex);
          addToHistory(newGroups, leaders);
          return newGroups;
        });
      }
    }
  };

  const handleRenameGroup = (index: number, name: string) => {
    setGroupNames((prev) => {
      const newNames = { ...prev, [index]: name };
      // Debounce history saving? Or just save on blur? 
      // For simplicity, we won't save history on every keystroke, but maybe we should?
      // Let's not save history on rename to avoid spamming.
      return newNames;
    });
  };

  const handleRenameParticipant = (groupIndex: number, participantIndex: number, name: string) => {
    setGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex] = [...newGroups[groupIndex]];
      newGroups[groupIndex][participantIndex] = { ...newGroups[groupIndex][participantIndex], name };
      // Debounce? Or just save? Let's save for now, user won't rename 100 times a second.
      // Actually, input onChange fires on every keystroke. This WILL spam history.
      // We should probably only save on blur or use a debounced callback.
      // For now, let's NOT save history on keystroke. 
      // Ideally GroupsGrid should handle local state and only call onRename on blur.
      // But GroupsGrid uses controlled input.
      // Let's leave history out of rename for now to avoid performance issues.
      return newGroups;
    });
  };

  const handleAddGroup = () => {
    setGroups((prev) => {
      const newGroups = [...prev, []];
      setGroupCount(newGroups.length);
      addToHistory(newGroups, leaders);
      return newGroups;
    });
  };

  const handleDeleteGroup = (index: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce groupe ?")) {
      setGroups((prev) => {
        const newGroups = prev.filter((_, i) => i !== index);
        setGroupCount(newGroups.length);

        // Shift leaders
        const newLeaders: Record<number, string> = {};
        Object.entries(leaders).forEach(([key, value]) => {
          const k = parseInt(key);
          if (k < index) newLeaders[k] = value;
          if (k > index) newLeaders[k - 1] = value;
        });
        setLeaders(newLeaders);

        // Shift group names
        const newGroupNames: Record<number, string> = {};
        Object.entries(groupNames).forEach(([key, value]) => {
          const k = parseInt(key);
          if (k < index) newGroupNames[k] = value;
          if (k > index) newGroupNames[k - 1] = value;
        });
        setGroupNames(newGroupNames);

        addToHistory(newGroups, newLeaders);
        return newGroups;
      });
    }
  };

  const handleBalance = () => {
    const balanced = balanceGroups(groups);
    setGroups(balanced);
    addToHistory(balanced, leaders);
  };

  const handleDeleteParticipant = (groupIndex: number, participantIndex: number) => {
    setGroups((prev) => {
      const newGroups = [...prev];
      newGroups[groupIndex] = [...newGroups[groupIndex]];
      newGroups[groupIndex].splice(participantIndex, 1);

      // Update history? Maybe not for every single deletion if user is cleaning up duplicates.
      // But deleting a person is significant. Let's save history.
      addToHistory(newGroups, leaders);
      return newGroups;
    });
  };

  // Calculate duplicates
  const allParticipants = groups.flat();
  const nameCounts = new Map<string, number>();
  allParticipants.forEach(p => {
    const name = p.name.trim().toLowerCase();
    if (name) {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }
  });

  const duplicates = new Set<string>();
  allParticipants.forEach(p => {
    const name = p.name.trim().toLowerCase();
    if (name && (nameCounts.get(name) || 0) > 1) {
      duplicates.add(p.name); // Add exact name to match in UI
    }
  });

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
              Répartiteur de Groupes
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Collez vos participants et créez des groupes aléatoires en un clic.
            </p>
          </div>
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            title="Historique"
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Historique</span>
          </button>
        </div>

        <HistoryPanel
          history={history}
          onRestore={handleRestore}
          onClear={handleClearHistory}
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-950">
          <div className="grid gap-6 md:grid-cols-2">
            <ParticipantsInput
              value={participantsText}
              onChange={setParticipantsText}
            />
            <div className="flex flex-col gap-6 h-full">
              <div className="flex-1 min-h-0">
                <LeadersInput
                  value={leadersText}
                  onChange={setLeadersText}
                  onApply={handleApplyLeaders}
                />
              </div>
              <GroupNumberInput
                value={groupCount}
                onChange={setGroupCount}
              />
              <div>
                <ShuffleButton
                  onClick={handleShuffle}
                  isLoading={isPending}
                />
              </div>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Erreur de répartition
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <ul className="list-disc space-y-1 pl-5">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <StatsDashboard groups={groups.map(g => g.map(p => p.name))} onBalance={handleBalance} />

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              placeholder="Rechercher un participant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ExportMenu groups={groups.map(g => g.map(p => p.name))} leaders={leaders} />
        </div>

        <GroupsGrid
          groups={groups}
          leaders={leaders}
          groupNames={groupNames}
          duplicates={duplicates}
          searchTerm={searchTerm}
          onLeaderChange={handleLeaderChange}
          onAddParticipant={handleAddParticipant}
          onRenameGroup={handleRenameGroup}
          onRenameParticipant={handleRenameParticipant}
          onDeleteGroup={handleDeleteGroup}
          onDeleteParticipant={handleDeleteParticipant}
          onAddGroup={handleAddGroup}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          activeId={activeId}
        />
      </div>
    </main>
  );
}
