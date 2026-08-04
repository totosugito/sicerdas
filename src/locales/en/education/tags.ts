export default {
    menu: "Tags",
    title: "Tag Management",
    description: "Manage labels or tags to facilitate searching and filtering exam questions.",
    editDescription: "Edit the selected tag data to fit exam question needs.",
    createDescription: "Add a new tag to enrich exam question categorization.",
    table: {
        search: "Search tags...",
        noData: "No tag data.",
        columns: {
            name: "Tag Name",
            description: "Description",
            status: "Status",
            totalQuestions: "Total Questions",
            createdAt: "Created At",
            updatedAt: "Updated At",
            actions: "Actions"
        },
        actions: {
            edit: "Edit",
            delete: "Delete",
            openMenu: "Open menu"
        },
        noResult: "No tag data found."
    },
    form: {
        name: {
            label: "Tag Name",
            placeholder: "e.g.: Hard, Easy, HOTS",
            required: "Tag name is required"
        },
        description: {
            label: "Description",
            placeholder: "Add a brief explanation about this tag..."
        },
        isActive: {
            label: "Active Status",
            description: "Active tags will be available in question selections."
        }
    },
    delete: {
        confirmTitle: "Delete Tag",
        confirmDesc: "Are you sure you want to delete tag '{{name}}'?",
        deleteInfo: "Deleted data cannot be recovered. This tag will be removed from all exam questions that use it.",
        success: "Tag deleted successfully.",
        error: "Failed to delete tag. Make sure it is not currently in use."
    },
    notifications: {
        createSuccess: "Tag added successfully.",
        updateSuccess: "Tag updated successfully.",
    }
}
