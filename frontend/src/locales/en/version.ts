const version = {
  title: "App Version",
  menu: "Version Management",
  fields: {
    appVersion: "App Version",
    dbVersion: "Database Version",
    dataType: "Data Type",
    status: "Status",
    name: "Name",
    note: "Notes",
    publishedAt: "Published At",
  },
  table: {
    search: "Search versions...",
    noResult: "Version not found",
    columns: {
      appVersion: "App Version",
      dbVersion: "DB Version",
      dataType: "Data Type",
      status: "Status",
      name: "Name",
      updatedAt: "Last Updated",
    },
  },
  delete: {
    confirmTitle: "Delete Version",
    confirmDesc: "Are you sure you want to delete version {{title}}?",
    deleteInfo: "Deleting this version will permanently remove the version data.",
    success: "Version deleted successfully",
    error: "Failed to load version details",
  },
  create: {
    title: "Create New Version",
    description: "Add a new application or database version to the system.",
  },
  edit: {
    title: "Edit Version",
    description: "Update application or database version information.",
  },
  backToPage: "Back to Version List",
  form: {
    appVersion: {
      label: "App Version",
      placeholder: "Enter app version (e.g.: 1)",
      required: "App version is required",
    },
    dbVersion: {
      label: "Database Version (yyMMDD)",
      placeholder: "Enter database version (e.g.: 260403)",
      required: "Database version is required",
    },
    dataType: {
      label: "Data Type",
      placeholder: "Select data type",
      required: "Data type is required",
      options: {
        book: "Book",
        exam: "Exam",
        test: "Test",
        course: "Course",
        other: "Other",
      },
    },
    status: {
      label: "Status",
      placeholder: "Select status",
      required: "Status is required",
    },
    name: {
      label: "Version Name",
      placeholder: "Enter version name",
      required: "Version name is required",
    },
    note: {
      label: "Changelog",
    },
  },
  notifications: {
    createSuccess: "Version created successfully",
    updateSuccess: "Version updated successfully",
  },
};

export default version;
