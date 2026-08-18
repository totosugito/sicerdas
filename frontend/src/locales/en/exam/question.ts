export default {
  menu: "Question Bank",
  label: "Question",
  title: "Exam Question Management",
  description: "Manage exam question bank, difficulty levels, and question categories.",
  testQuestions: "Exam Questions",
  backToPage: "Back to List",
  importJson: "Import from JSON",
  table: {
    search: "Search questions...",
    noData: "No question data.",
    columns: {
      content: "Question Content",
      subject: "Subject",
      difficulty: "Difficulty",
      type: "Type",
      educationGrade: "Grade / Level",
      maxScore: "Max Score",
      scoringStrategy: "Scoring Strategy",
      requiredTier: "Tier",
      totalOptions: "Options",
      status: "Status",
      updatedAt: "Updated At",
      actions: "Actions",
    },
    actions: {
      edit: "Edit",
      delete: "Delete",
      openMenu: "Open menu",
    },
    noResult: "No question data found.",
  },
  delete: {
    confirmTitle: "Delete Question",
    confirmDesc: "Are you sure you want to delete this question?",
    deleteInfo: "Deleting a question will permanently remove it from the question bank.",
    success: "Question deleted successfully.",
    error: "Failed to delete question.",
  },
  form: {
    subject: {
      label: "Subject",
      placeholder: "Select Subject",
      required: "Subject is required",
    },
    passage: {
      label: "Passage",
      placeholder: "Select Passage",
    },
    package: {
      label: "Exam Package",
      placeholder: "Select Package...",
    },
    section: {
      label: "Exam Section",
      placeholder: "Select Section...",
      required: "Exam section is required when a package is specified",
    },
    content: {
      label: "Question Content",
      placeholder: "Write or paste question content here...",
      required: "Question content cannot be empty",
    },
    difficulty: {
      label: "Difficulty Level",
      placeholder: "Select Difficulty",
      required: "Difficulty level is required",
      options: {
        easy: "Easy",
        medium: "Medium",
        hard: "Hard",
      },
    },
    type: {
      label: "Question Type",
      placeholder: "Select Type",
      required: "Question type is required",
      options: {
        multiple_choice: "Single Choice",
        multiple_select: "Multiple Choice",
        essay: "Essay",
        statement_reasoning: "Statement-Reasoning",
      },
    },
    reasonContent: {
      label: "Reason Content (Cause)",
      placeholder: "Write reason content here...",
    },
    requiredTier: {
      label: "Minimum Tier",
      placeholder: "Select Tier",
      required: "Minimum tier is required",
    },
    educationGrade: {
      label: "Grade / Level",
      placeholder: "Select Grade",
    },
    isActive: {
      label: "Active Status",
      description: "Active questions can be selected when creating exams.",
    },
    scoringStrategy: {
      label: "Scoring Strategy",
      placeholder: "Select Strategy",
      required: "Scoring strategy is required",
      options: {
        all_or_nothing: "All or Nothing",
        partial: "Partial",
        partial_with_penalty: "Partial + Penalty",
      },
    },
    maxScore: {
      label: "Maximum Score",
      placeholder: "Enter maximum score",
      required: "Maximum score is required",
    },
  },
  create: {
    title: "Add Question",
    description: "Create a new question for the question bank.",
    success: "Question added successfully.",
  },
  edit: {
    title: "Edit Question",
    description: "Update question content or settings.",
    success: "Question updated successfully.",
    tabs: {
      settings: "Settings",
      content: "Edit Question",
      options: "Options",
      solutions: "Solutions",
      tags: "Tags",
      variables: "Variables",
      preview: "Preview",
    },
    settings: {
      title: "General Settings",
      description:
        "Configure the subject, difficulty level, tier, and education level for this question.",
    },
    content: {
      title: "Question Content",
      description: "Enter the question text using the rich-text editor below.",
    },
    notFound: {
      title: "Question Not Found",
      message:
        "The question data was not found or an error occurred while retrieving data from the server.",
      retryButton: "Retry",
    },
    loading: "Loading question data...",
    loadingTitle: "Loading",
    tags: {
      title: "Topic Tags",
      description: "Manage the tag list for classifying this question.",
      placeholder: "Add tag...",
      addButton: "Add",
      empty: "No tags have been added yet.",
      noResult: "No tags found.",
      addAsNew: 'Add "{{name}}" as a new tag',
      existingTags: "Existing Tags",
    },
    variables: {
      title: "Question Variables",
      description: "Configure dynamic variables and solution formulas for this question.",
    },
    preview: {
      title: "Question Preview",
      description: "Simulate the question view for students with injected variables.",
      variationSelection: "Select Variation:",
      noVariables: "This question has no variables. Displaying static content.",
      studentViewBadge: "Student View Preview",
      variationBadge: "Variation #{{index}}",
    },
  },
  detail: {
    title: "Question Details",
    description: "View complete information, content, answer options, and solutions for this question.",
    editButton: "Edit Question",
    tabs: {
      info: "General Info",
      content: "Content & Answers",
      solutions: "Solutions",
    },
    info: {
      title: "General Info",
      description: "Question metadata details and settings.",
    },
    content: {
      title: "Question Content",
      noPassage: "No related passage.",
    },
    options: {
      title: "Answer Options",
      correctAnswer: "Correct Answer",
    },
    solutions: {
      title: "Solutions / Explanations",
      empty: "No solutions available for this question yet.",
    },
  },
  jsonQuestions: {
    title: "JSON Question Preview",
    description:
      "Preview exam questions from a JSON file locally without saving them to the database.",
    importButton: "Import JSON",
    pasteButton: "Paste JSON",
    clearButton: "Clear",
    promptGeneratorButton: "AI Prompt Generator",
    questionNumber: "Question",
    selectQuestion: "Select a question to view its details.",
    noJsonImported: "No JSON questions have been imported yet.",
    noJsonImportedDesc: 'Click the "Import JSON" or "Paste JSON" button to load questions.',
    pasteModalTitle: "Paste JSON Data",
    pasteModalPlaceholder: "Paste your JSON content here...",
    cancel: "Cancel",
    submit: "Submit",
    invalidFormat: "Invalid JSON format: Expected a question object or array.",
    parseError: "Failed to parse JSON.",
    exportSelected: "Export Selected",
    exportSuccess: "Successfully exported {count} questions.",
    exportError: "Failed to export questions: {error}",
    exporting: "Exporting...",
    globalParameters: {
      title: "Global Parameters",
      overrideNote:
        "Note: The parameters above will override values in the JSON file when exporting to the question bank.",
      selectAll: "Select All ({selected}/{total})",
    },
    packageParameters: {
      title: "Exam Package Parameters",
      description: "Select an exam package and section to assign exported questions.",
      overrideNote:
        "Note: If selected, exported questions will be automatically assigned to this exam package and section.",
    },
    promptGenerator: {
      description: "Dynamically create AI prompts based on specific task parameters.",
      paramsCard: {
        title: "Task Parameters",
        description: "Fill in the parameters below to set additional instructions for the AI.",
        curriculum: "Curriculum",
        curriculumPlaceholder: "e.g.: National Curriculum",
        grade: "Grade/Level",
        gradePlaceholder: "e.g.: High School Grade 10",
        subject: "Subject",
        subjectPlaceholder: "e.g.: Physics",
        language: "Answer Language",
        languagePlaceholder: "e.g.: Formal English",
        sourceMaterial: "Source Material (Instruction Prompt)",
        sourceMaterialPlaceholder:
          "Describe the question requirements or type 'From the attached image...'",
        presets: {
          title: "Quick Prompt Samples",
          image: "Extract Image",
          topic: "Create from Topic",
          variation: "Create Variations",
          bulk: "Bulk Create",
          prompts: {
            image:
              "Please extract all questions from the attached image. Capture all text and diagrams/formulas accurately, then create the JSON format.",
            topic:
              "Please create 3 HOTS-type questions about [TOPIC_NAME]. Use variables for calculations if possible.",
            variation:
              "Here is a sample question: '[SAMPLE_QUESTION]'. Please create 5 variations of this question with different numbers in JSON variables array format.",
            bulk: "Please create 10 multiple choice questions about [TOPIC_NAME] with difficulty levels ranging from Easy, Medium, to Hard.",
          },
        },
      },
      outputCard: {
        title: "Prompt Markdown Output",
        description: "Copy this text to ChatGPT, Claude, or Gemini.",
        copyButton: "Copy to Clipboard",
        copiedButton: "Copied Successfully!",
        copyError: "Failed to copy text to clipboard.",
      },
    },
  },
};
