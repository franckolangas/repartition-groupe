'use client';

import { useState } from "react";
import { Plus, X, GripVertical, Trash2 } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Participant } from "@/lib/types";
import { GROUP_COLORS } from "@/lib/utils";

interface GroupsGridProps {
  groups: Participant[][];
  leaders: Record<number, string>;
  groupNames: Record<number, string>;
  duplicates: Set<string>;
  onLeaderChange: (index: number, value: string) => void;
  onAddParticipant: (groupIndex: number, name: string) => void;
  onRenameGroup: (index: number, name: string) => void;
  onRenameParticipant: (groupIndex: number, participantIndex: number, name: string) => void;
  onDeleteGroup: (index: number) => void;
  onDeleteParticipant: (groupIndex: number, participantIndex: number) => void;
  onAddGroup: () => void;
  onDragEnd: (event: DragEndEvent) => void;
  onDragOver: (event: DragOverEvent) => void;
  onDragStart: (event: DragStartEvent) => void;
  activeId: string | null;
}

export function GroupsGrid({
  groups,
  leaders,
  groupNames,
  duplicates,
  onLeaderChange,
  onAddParticipant,
  onRenameGroup,
  onRenameParticipant,
  onDeleteGroup,
  onDeleteParticipant,
  onAddGroup,
  onDragEnd,
  onDragOver,
  onDragStart,
  activeId
}: GroupsGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  };

  if (!groups.length) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {groups.map((group, index) => (
          <SortableGroup
            key={index}
            id={`group-${index}`}
            index={index}
            group={group}
            leader={leaders[index]}
            groupName={groupNames[index]}
            duplicates={duplicates}
            onLeaderChange={onLeaderChange}
            onAddParticipant={onAddParticipant}
            onRenameGroup={onRenameGroup}
            onRenameParticipant={onRenameParticipant}
            onDeleteGroup={onDeleteGroup}
            onDeleteParticipant={onDeleteParticipant}
          />
        ))}

        <button
          onClick={onAddGroup}
          className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-4 text-gray-500 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
        >
          <Plus className="mb-2 h-8 w-8" />
          <span className="font-medium">Ajouter un groupe</span>
        </button>
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? <ItemOverlay id={activeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableGroup({
  id,
  index,
  group,
  leader,
  groupName,
  duplicates,
  onLeaderChange,
  onAddParticipant,
  onRenameGroup,
  onRenameParticipant,
  onDeleteGroup,
  onDeleteParticipant,
}: {
  id: string;
  index: number;
  group: Participant[];
  leader: string;
  groupName: string;
  duplicates: Set<string>;
  onLeaderChange: (index: number, value: string) => void;
  onAddParticipant: (groupIndex: number, name: string) => void;
  onRenameGroup: (index: number, name: string) => void;
  onRenameParticipant: (groupIndex: number, participantIndex: number, name: string) => void;
  onDeleteGroup: (index: number) => void;
  onDeleteParticipant: (groupIndex: number, participantIndex: number) => void;
}) {
  const { setNodeRef } = useSortable({ id });
  const color = GROUP_COLORS[index % GROUP_COLORS.length];

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg border p-4 ${color.border} ${color.bg} ${color.darkBg}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <input
          type="text"
          className="bg-transparent font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 dark:text-gray-50"
          value={groupName || `Groupe ${index + 1}`}
          onChange={(e) => onRenameGroup(index, e.target.value)}
          placeholder={`Groupe ${index + 1}`}
        />
        <button
          onClick={() => onDeleteGroup(index)}
          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
          title="Supprimer le groupe"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-3">
        <label htmlFor={`leader-${index}`} className="sr-only">Responsable</label>
        <input
          type="text"
          id={`leader-${index}`}
          placeholder="Nom du responsable"
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
          value={leader || ""}
          onChange={(e) => onLeaderChange(index, e.target.value)}
        />
      </div>

      <SortableContext
        id={id}
        items={group.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="mb-4 flex-1 space-y-1 min-h-[50px]">
          {group.map((participant, pIndex) => (
            <SortableItem
              key={participant.id}
              id={participant.id}
              name={participant.name}
              isDuplicate={duplicates.has(participant.name)}
              groupIndex={index}
              participantIndex={pIndex}
              onRename={onRenameParticipant}
              onDelete={() => onDeleteParticipant(index, pIndex)}
            />
          ))}
        </ul>
      </SortableContext>

      <div className="mt-auto border-t border-gray-100 pt-3 dark:border-gray-800">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium">{group.length} participant{group.length > 1 ? 's' : ''}</span>
        </div>
        <AddParticipantForm onAdd={(name) => onAddParticipant(index, name)} />
      </div>
    </div>
  );
}

function SortableItem({
  id,
  name,
  isDuplicate,
  groupIndex,
  participantIndex,
  onRename,
  onDelete,
}: {
  id: string;
  name: string;
  isDuplicate: boolean;
  groupIndex: number;
  participantIndex: number;
  onRename: (gIndex: number, pIndex: number, name: string) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 rounded p-1 hover:bg-gray-50 dark:hover:bg-gray-800 ${isDuplicate ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <input
        type="text"
        className={`flex-1 bg-transparent text-sm focus:outline-none ${isDuplicate ? 'text-red-700 font-medium dark:text-red-300' : 'text-gray-600 focus:text-gray-900 dark:text-gray-400 dark:focus:text-gray-200'}`}
        value={name}
        onChange={(e) => onRename(groupIndex, participantIndex, e.target.value)}
      />
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
        title="Supprimer"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </li>
  );
}

function ItemOverlay({ id }: { id: string }) {
  return (
    <div className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 p-2 shadow-lg dark:border-blue-800 dark:bg-blue-900/50">
      <GripVertical className="h-4 w-4 text-blue-500" />
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
        Déplacement...
      </span>
    </div>
  );
}

function AddParticipantForm({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim());
      setName("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Ajouter..."
        className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button
        type="submit"
        disabled={!name.trim()}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Ajouter</span>
      </button>
    </form>
  );
}
