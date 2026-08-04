export default {
  menu: "Grades",
  title: "Education Levels",
  text: "Grade",
  description: "Manage education level data to link with grades",
  createDescription: "Add a new education level",
  editDescription: "Edit this education level data",
  table: {
    search: "Search education levels...",
    noResult: "Education level not found.",
    columns: {
      grade: "Grade",
      name: "Name",
      desc: "Description",
      isDefault: "Default",
      updatedAt: "Updated",
      actions: "Actions",
    },
    actions: {
      openMenu: "Open menu",
      edit: "Edit",
      delete: "Delete",
    },
  },
  form: {
    grade: {
      label: "Level Code",
      placeholder: "e.g.: 1, 2, tk, sma",
      required: "Level code is required",
      invalidFormat: "Code may only contain lowercase letters, numbers, underscores (_), or hyphens (-)",
    },
    name: {
      label: "Level Name",
      placeholder: "e.g.: Grade 1, Kindergarten, Senior High School",
      required: "Level name is required",
    },
    desc: {
      label: "Description",
      placeholder: "Enter a brief description",
    },
    isDefault: {
      label: "Set as Default",
      description: "Mark as the primary or default education level",
    },
  },
  delete: {
    success: "Education level deleted successfully",
    confirmTitle: "Delete Education Level",
    confirmDesc: "Are you sure you want to delete '{{name}}'?",
    deleteInfo:
      "This action cannot be undone. Deleting this data will also remove references from other components.",
    notFound: "Education level not found.",
  },
  notifications: {
    createSuccess: "Education level added successfully",
    updateSuccess: "Education level updated successfully",
  },
};
