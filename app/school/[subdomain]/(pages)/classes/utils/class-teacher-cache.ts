import type { QueryClient } from "@tanstack/react-query";
import type { ClassTeacherAssignment } from "@/lib/hooks/useClassTeacherAssignment";
import { classTeacherQueryKey } from "@/lib/hooks/useClassTeacherAssignment";

export { classTeacherQueryKey };

export function classTeacherQueryKeysForAssign(opts: {
  gradeLevelId?: string;
  streamId?: string;
}) {
  const gradeKey = opts.streamId ? null : (opts.gradeLevelId ?? null);
  const streamKey = opts.streamId ?? null;
  return { gradeKey, streamKey, queryKey: classTeacherQueryKey(gradeKey, streamKey) };
}

export function mapAssignResponseToAssignment(
  data: Record<string, unknown> | null | undefined,
  selected: { id: string; fullName: string; email: string },
  streamId?: string,
  streamName?: string,
): ClassTeacherAssignment {
  const teacher = (data?.teacher as ClassTeacherAssignment["teacher"]) ?? {
    id: selected.id,
    fullName: selected.fullName,
    email: selected.email,
  };

  return {
    id: (data?.id as string) ?? `temp-${Date.now()}`,
    active: (data?.active as boolean) ?? true,
    startDate: data?.startDate as string | undefined,
    endDate: data?.endDate as string | undefined,
    teacher: {
      id: teacher.id ?? selected.id,
      fullName: teacher.fullName ?? selected.fullName,
      email: teacher.email ?? selected.email,
    },
    stream: data?.stream as ClassTeacherAssignment["stream"],
    gradeLevel: data?.gradeLevel as ClassTeacherAssignment["gradeLevel"],
    ...(streamId && !data?.stream
      ? {
          stream: {
            id: "",
            stream: { id: streamId, name: streamName ?? "" },
          },
        }
      : {}),
  };
}

/** Update class detail, directory, and teacher lists after assign/unassign. */
export async function refreshAfterClassTeacherChange(
  queryClient: QueryClient,
  opts: {
    gradeLevelId?: string;
    streamId?: string;
    assignment?: ClassTeacherAssignment | null;
  },
) {
  const { gradeKey, streamKey, queryKey } = classTeacherQueryKeysForAssign(opts);

  if (opts.assignment !== undefined) {
    queryClient.setQueryData(queryKey, opts.assignment);
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["campusClassTeachers"] }),
    queryClient.invalidateQueries({ queryKey: ["getTeachers"] }),
    queryClient.invalidateQueries({ queryKey: ["teachers"] }),
    queryClient.invalidateQueries({ queryKey: ["teachers-by-tenant"] }),
    queryClient.invalidateQueries({ queryKey: ["schoolConfig"] }),
  ]);

  // Keep optimistic assignment; a blind refetch was clearing the UI when lookup failed.
  if (opts.assignment === undefined) {
    await queryClient.invalidateQueries({ queryKey: ["classTeacherAssignment"] });
    await queryClient.refetchQueries({ queryKey, type: "active" });
  } else {
    await queryClient.invalidateQueries({
      queryKey: ["classTeacherAssignment"],
      refetchType: "none",
    });
  }
}
