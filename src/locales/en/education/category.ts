export default {
  menu: "Categories",
  title: "Category Management",
  text: "Category",
  description: "Manage exam categories to organize question packages.",
  editDescription: "Edit exam category to organize question packages.",
  createDescription: "Add exam category to organize question packages.",
  table: {
    search: "Search categories...",
    noData: "No category data.",
    columns: {
      name: "Category Name",
      description: "Description",
      status: "Status",
      createdAt: "Created At",
      updatedAt: "Updated At",
      actions: "Actions",
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
      openMenu: "Open menu",
    },
    noResult: "No category data.",
  },
  form: {
    name: {
      label: "Category Name",
      placeholder: "e.g.: UTBK SNBT 2026",
      required: "Name is required",
    },
    description: {
      label: "Description",
      placeholder: "Brief description about this category...",
    },
    isActive: {
      label: "Active Status",
      description: "Active categories are visible to users.",
    },
  },
  dialog: {
    addTitle: "Add Category",
    editTitle: "Edit Category",
    nameLabel: "Category Name",
    descriptionLabel: "Description",
    submit: "Save",
    cancel: "Cancel",
  },
  delete: {
    confirmTitle: "Delete Category",
    confirmDesc: "Are you sure you want to delete category '{{name}}'?",
    deleteInfo:
      "Deleted data cannot be undone and all question packages associated with this category will lose their category reference.",
    success: "Category deleted successfully.",
    error: "Failed to delete category.",
  },
  notifications: {
    createSuccess: "Category added successfully.",
    updateSuccess: "Category updated successfully.",
  },
};
