export default {
    menu: "Passages",
    title: "Exam Passage Management",
    description: "Manage reading passages, graphs, or long-form contexts used for multiple questions.",
    backToPage: "Back to List",
    table: {
        search: "Search passages...",
        noData: "No passage data.",
        columns: {
            title: "Passage Title",
            subject: "Subject",
            questions: "Questions",
            status: "Status",
            updatedAt: "Updated At",
            actions: "Actions"
        },
        actions: {
            edit: "Edit",
            delete: "Delete",
            openMenu: "Open menu"
        },
        noResult: "No passage data found."
    },
    delete: {
        confirmTitle: "Delete Passage",
        confirmDesc: "Are you sure you want to delete passage '{{title}}'?",
        deleteInfo: "Deleting this passage may affect linked questions. Make sure no questions are using this passage before deleting.",
        success: "Passage deleted successfully.",
        error: "Failed to delete passage."
    },
    form: {
        title: {
            label: "Passage Title",
            placeholder: "Enter internal passage title",
            required: "Passage title is required"
        },
        subject: {
            label: "Subject",
            placeholder: "Select Subject",
            required: "Subject is required"
        },
        content: {
            label: "Passage Content",
            placeholder: "Write or paste passage content here...",
            required: "Passage content cannot be empty"
        },
        isActive: {
            label: "Active Status",
            description: "Active passages can be selected when creating questions."
        }
    },
    create: {
        title: "Add Passage",
        description: "Create a new passage for use in exams.",
    },
    edit: {
        title: "Edit Passage",
        description: "Update passage content or settings.",
    },
    notifications: {
        createSuccess: "Passage added successfully.",
        updateSuccess: "Passage updated successfully."
    }
}
