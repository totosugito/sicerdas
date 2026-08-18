export default {
    menu: "Subjects",
    title: "Subject Management",
    description: "Manage exam subjects.",
    editDescription: "Edit exam subject data.",
    createDescription: "Add a new exam subject.",
    table: {
        search: "Search subjects...",
        noData: "No subject data.",
        columns: {
            name: "Subject Name",
            description: "Description",
            status: "Status",
            createdAt: "Created At",
            updatedAt: "Updated At",
            actions: "Actions"
        },
        actions: {
            edit: "Edit",
            delete: "Delete",
            openMenu: "Open menu"
        },
        noResult: "No subject data."
    },
    form: {
        name: {
            label: "Subject Name",
            placeholder: "e.g.: General Intelligence Test (TIU)",
            required: "Name is required"
        },
        description: {
            label: "Description",
            placeholder: "Brief description about this subject..."
        },
        isActive: {
            label: "Active Status",
            description: "Active subjects are visible to users."
        }
    },
    dialog: {
        addTitle: "Add Subject",
        editTitle: "Edit Subject",
        nameLabel: "Subject Name",
        descriptionLabel: "Description",
        submit: "Save",
        cancel: "Cancel"
    },
    delete: {
        confirmTitle: "Delete Subject",
        confirmDesc: "Are you sure you want to delete subject '{{name}}'?",
        deleteInfo: "Deleted data cannot be undone.",
        success: "Subject deleted successfully.",
        error: "Failed to delete subject."
    },
    notifications: {
        createSuccess: "Subject added successfully.",
        updateSuccess: "Subject updated successfully.",
    }
}
