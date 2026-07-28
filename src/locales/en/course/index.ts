export default {
  menu: "Course",
  title: "Course Management",
  description: "Manage course materials, chapters, modules, and education grade levels.",
  courses: {
    menu: "Courses List",
    title: "Course Management",
    description: "Manage course catalog, draft courses, and organize learning content.",
    table: {
      search: "Search courses...",
      noData: "No course data available.",
      columns: {
        code: "Code",
        name: "Course Name",
        category: "Category",
        price: "Price",
        status: "Status",
        createdAt: "Created At",
        actions: "Actions",
      },
      sort: {
        placeholder: "Sort By",
        courseCode: "Course Code",
        courseName: "Course Name",
        createdAt: "Newest",
        updatedAt: "Last Updated",
        price: "Price",
        status: "Status",
      },
      viewModes: {
        table: "Table",
        card: "Card",
      },
    },
    delete: {
      confirmTitle: "Delete Course",
      confirmDesc: "Are you sure you want to delete course '{{title}}'?",
      deleteInfo: "Deleted data cannot be recovered. All chapters and lectures within this course will also be removed.",
    },
    create: {
      title: "Create Course",
      description: "Create a new course draft.",
    },
    edit: {
      title: "Edit Course",
      description: "Update course details and content.",
    },
    detail: {
      title: "Course Detail",
      description: "View course details and learning materials structure.",
    },
    form: {
      courseCode: {
        label: "Course Code",
        placeholder: "Enter course code (e.g. MATH101)",
        required: "Course code is required",
      },
      courseName: {
        label: "Course Name",
        placeholder: "Enter course name",
        required: "Course name is required",
      },
      categoryId: {
        label: "Category",
        placeholder: "Select category",
        required: "Category is required",
      },
      educationGradeId: {
        label: "Education Grade",
        placeholder: "Select education grade",
        required: "Education grade is required",
      },
      price: {
        label: "Price (Rp)",
        placeholder: "0",
      },
      status: {
        label: "Status",
        placeholder: "Select status",
      },
      courseDescription: {
        label: "Course Description",
        placeholder: "Enter short description...",
      },
      whatYouWillLearn: {
        label: "What You Will Learn",
        placeholder: "Learning outcomes description...",
      },
      isPublic: {
        label: "Public Access",
        description: "Publicly accessible to all users",
      },
      isSequential: {
        label: "Sequential Learning",
        description: "Lectures must be completed in order",
      },
      thumbnail: {
        label: "Course Thumbnail",
        upload: "Upload Image",
        change: "Change Image",
        remove: "Remove",
      },
      infoTitle: "Primary Information",
      livePreview: "Live Authoring Preview",
      preview: {
        thumbnailPlaceholder: "Preview Thumbnail",
        defaultCode: "COURSE-CODE",
        defaultName: "Course Name",
        defaultDescription: "Course description will appear here.",
        freeText: "Free",
      },
    },
  },
};
