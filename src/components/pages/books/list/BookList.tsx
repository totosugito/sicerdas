import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { Calendar, BookOpen, FileText } from "lucide-react"
import { Book, getBookCover } from "../types/books"
import { BookStats } from "./BookStats"
import { formatFileSize } from "@/lib/my-utils"
import { useTranslation } from "react-i18next"

export const BookList = ({ book }: { book: Book }) => {
    const {t} = useTranslation();
    return (
        <Link
            key={book.id}
            to="/book/$bookId"
            params={{ bookId: book.id.toString() }}
            className="group block"
        >
            <Card className="group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm py-0">
                <div className="flex">
                    {/* Book Cover - Left Side */}
                    <div className="relative overflow-hidden w-32 flex-shrink-0">
                        <img
                            src={getBookCover(book.id, "md")}
                            alt={`Cover of ${book.title}`}
                            className="w-full h-42 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Content - Right Side */}
                    <div className="flex-1 flex flex-col">
                        <CardHeader className="px-4 py-3 flex-shrink-0">
                            <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                                {book.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 text-sm">
                                {book.author}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="px-4 py-0 flex-1">
                            <div className="flex justify-start items-center mb-3 gap-2">
                                <Badge variant={"outline"} className="text-xs">
                                {book.grade.name} - {book.grade.grade}
                            </Badge>
                                <Badge variant="outline" className="text-xs">
                                    {book.group.name}
                                </Badge>
                            </div>

                            {/* Book Details */}
                            <div className="flex flex-wrap gap-4 mb-3 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    <span>{book.totalPages} {t('labels.pages')}</span>
                                </div>
                                <div className="flex items-center">
                                    <FileText className="w-3 h-3 mr-1" />
                                    <span>{formatFileSize(book.size)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    <span>{t('labels.published')} {book.publishedYear}</span>
                                </div>
                            </div>

                            {/* Stats Section */}
                            <BookStats book={book}/>
                        </CardContent>
                    </div>
                </div>
            </Card>
        </Link>
    )
}