import courses from "./courses";
import chapters from "./chapters";
import lectureTexts from "./lecture-texts";
import lectures from "./lectures";
import publicCourse from "./public";
import dashboard from "./dashboard";

const obj = {
  menu: "Kursus",
  title: "Manajemen Kursus",
  description: "Kelola materi kursus, bab, modul, dan tingkat pendidikan.",
  courses,
  chapters,
  lectureTexts,
  lectures,
  public: publicCourse,
  dashboard,
};

export default obj;
