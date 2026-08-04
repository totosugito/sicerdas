export default {
  title: "Solutions & Explanations",
  description: "Provide step-by-step explanations and tips for answering questions.",
  addButton: "New Solution",
  empty:
    'Click the "New Solution" button to add additional explanations such as quick tricks or special tips.',
  form: {
    title: {
      label: "Solution Title",
      placeholder: "e.g.: Quick Algebra Method",
    },
    type: {
      label: "Solution Type",
      placeholder: "Select Type",
      options: {
        general: "General",
        fast_method: "Quick Method",
        video_link: "Video Link",
        tips: "Tips & Tricks",
      },
    },
    requiredTier: {
      label: "Minimum Tier",
      placeholder: "Select Tier",
    },
    content: {
      label: "Solution Content",
      placeholder: "Write the step-by-step explanation here...",
    },
  },
  orderSuccess: "Solution order updated successfully.",
  orderError: "Failed to update solution order.",
  dialog: {
    addTitle: "Add Solution",
    editTitle: "Edit Solution",
    createDescription: "Add a new solution to help students understand the question.",
    editDescription: "Update the content or settings of this solution.",
  },
  delete: {
    confirmTitle: "Delete Solution",
    confirmDesc: "Are you sure you want to delete this solution?",
    deleteInfo: "Deleted data cannot be recovered.",
    success: "Solution deleted successfully.",
    error: "Failed to delete solution.",
  },
};
