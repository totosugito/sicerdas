export default {
  list: {
    success: "Questions retrieved successfully",
  },
  assign: {
    success: "Questions assigned to exam package successfully",
    details: "(Success: {{assigned}}, Failed/Skipped: {{skipped}})",
  },
  unassign: {
    success: "Question removed from exam package successfully",
  },
  addModal: {
    title: "Select Questions to Add",
    description:
      "Select one or more questions from the list below to add to this section.",
    filterTitle: "Filter Questions",
    resetFilter: "Reset Filter",
    cancel: "Cancel",
    confirm: "Add {{count}} Questions",
    options: {
      allSubjects: "All Subjects",
      allGrades: "All Grades",
      allTiers: "All Tiers",
      allTypes: "All Types",
      allDifficulties: "All Difficulties",
    },
  },
  detail: {
    subtitle: "Manage and view the list of questions in this section.",
    totalCount: "{{count}} Questions",
    addButton: "Add Questions",
    createButton: "Create New Question",
    errors: {
      assign: "Failed to add questions",
      unassign: "Failed to remove question",
      reorder: "Failed to reorder questions",
      load: {
        title: "Failed to Load Questions",
        message: "The system failed to retrieve the question list for this section.",
        retry: "Retry",
      },
    },
  },
  removeModal: {
    title: "Remove Question from Section",
    description:
      "Are you sure you want to remove this question from the section? This action cannot be undone.",
    confirm: "Yes, Remove",
    cancel: "Cancel",
  },
};
