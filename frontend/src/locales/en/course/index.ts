import courses from "./courses";
import chapters from "./chapters";
import lectureTexts from "./lecture-texts";
import lectures from "./lectures";
import publicCourse from "./public";
import dashboard from "./dashboard";

const obj = {
  menu: "Course",
  title: "Course Management",
  description: "Manage course materials, chapters, modules, and education grade levels.",
  courses,
  chapters,
  lectureTexts,
  lectures,
  public: publicCourse,
  dashboard,
};

export default obj;
