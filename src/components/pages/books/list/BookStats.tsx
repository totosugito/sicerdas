import { Eye, Heart, Star } from "lucide-react";
import { Book } from "../types/books";

export const BookStats = ({ book }: { book: Book }) => {
    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-4">
                <div className="flex items-center text-muted-foreground text-xs">
                    <Eye className="w-4 h-4 mr-1" />
                    {book.view ?? 0}
                </div>
                {(book?.rating ?? 0) > 0 && (
                    <div className="flex items-center text-foreground text-xs font-medium">
                        <Star className="w-4 h-4 text-amber-500 mr-1 fill-current" />
                        <span className="text-amber-600 dark:text-amber-400">{book.rating ?? 0}</span>
                    </div>
                )}
            </div>
            <div className="flex items-center text-foreground text-xs font-medium">
                <Heart className={`w-4 h-4 transition-colors mr-1 ${book.favorite
                    ? 'text-red-500 fill-current hover:text-red-600'
                    : 'text-muted-foreground hover:text-red-400'
                    }`} />
                <span className="">{book.favoriteTotal ?? 0}</span>
            </div>
        </div>
    );
}