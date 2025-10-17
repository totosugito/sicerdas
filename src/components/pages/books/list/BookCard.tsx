import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "@tanstack/react-router"
import { Calendar } from "lucide-react"
import { Book, getBookCover } from "../types/books"
import { BookStats } from "./BookStats"

export const BookCard = ({ book }: { book: Book }) => {
    return (
        <Link
            key={book.id}
            to="/book/$bookId"
            params={{ bookId: book.id.toString() }}
            className="group block"
        >
            <Card className="h-full group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-300 overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm pt-0 pb-3 gap-3">
                <div className="relative overflow-hidden">
                    <img
                        src={getBookCover(book.id, "md")} alt={`Cover of ${book.title}`}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                        <Badge variant={"default"}>
                            {book.grade.name} - {book.grade.grade}
                        </Badge>
                    </div>
                </div>

                <CardHeader className="px-4 gap-1">
                    <CardTitle className="text-lg font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                        {book.author}
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 py-0 my-0">
                    {/* <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                        {book.description}
                    </p> */}
                    <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-xs">
                            {book.group.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                            <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {book.publishedYear}
                            </div>
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="px-4 border-t border-border bg-muted/20 [.border-t]:pt-2">
                    <BookStats book={book} />
                </CardFooter>
            </Card>
        </Link>
    )
}