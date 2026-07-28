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
  },
};
