export default {
  title: "Answer Options",
  description: "Add and define answer options for multiple choice questions.",
  addButton: "Add Option",
  empty: "No answer options have been added yet.",
  correct: "Correct",
  incorrect: "Incorrect",
  contentPlaceholder: "Option with text/image content...",
  noContent: "No content",
  orderSuccess: "Option order updated successfully.",
  orderError: "Failed to update option order.",
  notifications: {
    createSuccess: "Answer option added successfully.",
    updateSuccess: "Answer option updated successfully.",
    deleteSuccess: "Answer option deleted successfully.",
  },
  form: {
    content: {
      label: "Option Content",
      placeholder: "Write option content here...",
      required: "Option content cannot be empty",
    },
    isCorrect: {
      label: "Correct Option",
      description: "Mark if this is the correct answer",
    },
    score: {
      label: "Option Score",
      placeholder: "Enter score for this option",
      required: "Option score is required",
    },
  },
  dialog: {
    addTitle: "Add Answer Option",
    editTitle: "Edit Answer Option",
    addDescription: "Add a new answer option for this question.",
    editDescription: "Update the content or correctness status of this answer option.",
  },
  delete: {
    confirmTitle: "Delete Answer Option",
    confirmDesc: "Are you sure you want to delete this answer option?",
    deleteInfo: "Deleted data cannot be recovered.",
    success: "Answer option deleted successfully.",
    error: "Failed to delete answer option.",
  },
};
