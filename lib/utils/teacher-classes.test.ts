import { describe, expect, it } from 'vitest';
import {
  classTeacherClasses,
  mergeTeacherGradeLevels,
  type TeacherClassAssignment,
} from './teacher-classes';

function gradeAssignment(
  id: string,
  gradeId: string,
  gradeName: string,
  active = true,
): TeacherClassAssignment {
  return {
    id,
    active,
    gradeLevel: { id: gradeId, gradeLevel: { id: `catalog-${gradeId}`, name: gradeName } },
  };
}

describe('classTeacherClasses', () => {
  it('returns the grade of a grade-level class teacher assignment', () => {
    expect(classTeacherClasses([gradeAssignment('a1', 'g4', 'Grade 4')])).toEqual([
      { id: 'g4', name: 'Grade 4', streamId: undefined, streamName: undefined },
    ]);
  });

  it('ignores inactive assignments', () => {
    expect(
      classTeacherClasses([gradeAssignment('a1', 'g4', 'Grade 4', false)]),
    ).toEqual([]);
  });

  it('reads the grade from the stream for stream-level assignments', () => {
    const assignments: TeacherClassAssignment[] = [
      {
        id: 'a1',
        active: true,
        stream: {
          id: 'ts-4b',
          stream: { id: 's-4b', name: '4B' },
          tenantGradeLevel: {
            id: 'g4',
            gradeLevel: { id: 'catalog-g4', name: 'Grade 4' },
          },
        },
      },
    ];

    expect(classTeacherClasses(assignments)).toEqual([
      { id: 'g4', name: 'Grade 4', streamId: 'ts-4b', streamName: '4B' },
    ]);
  });

  it('dedupes a grade that has both a grade-wide and a stream assignment', () => {
    const assignments: TeacherClassAssignment[] = [
      gradeAssignment('a1', 'g4', 'Grade 4'),
      {
        id: 'a2',
        active: true,
        stream: {
          id: 'ts-4b',
          stream: { id: 's-4b', name: '4B' },
          tenantGradeLevel: {
            id: 'g4',
            gradeLevel: { id: 'catalog-g4', name: 'Grade 4' },
          },
        },
      },
    ];

    expect(classTeacherClasses(assignments)).toHaveLength(1);
  });

  it('skips assignments with no resolvable grade', () => {
    expect(classTeacherClasses([{ id: 'a1', active: true, gradeLevel: null }])).toEqual(
      [],
    );
    expect(classTeacherClasses(undefined)).toEqual([]);
  });
});

describe('mergeTeacherGradeLevels', () => {
  it('keeps assigned grades and adds owned classes that are missing', () => {
    const merged = mergeTeacherGradeLevels(
      [{ id: 'g5', gradeLevel: { id: 'catalog-g5', name: 'Grade 5' } }],
      [{ id: 'g4', name: 'Grade 4' }],
    );

    expect(merged.map((grade) => grade.id)).toEqual(['g4', 'g5']);
    expect(merged.map((grade) => grade.name)).toEqual(['Grade 4', 'Grade 5']);
  });

  it('does not duplicate a class already assigned', () => {
    const merged = mergeTeacherGradeLevels(
      [{ id: 'g4', gradeLevel: { id: 'catalog-g4', name: 'Grade 4' } }],
      [{ id: 'g4', name: 'Grade 4' }],
    );

    expect(merged).toHaveLength(1);
  });

  it('falls back to the short name when the catalog grade is missing', () => {
    const merged = mergeTeacherGradeLevels(
      [{ id: 'g4', gradeLevel: null, shortName: 'G4' }],
      [],
    );

    expect(merged[0]).toMatchObject({ id: 'g4', name: 'G4' });
  });
});
