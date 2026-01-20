import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "react-i18next"
import { Book } from "../types/books"
import {Image} from "lucide-react"

export const SamplePages = ({book, samplePages}: {book: Book, samplePages: any}) => {
    const { t } = useTranslation()
    return (
        <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <Image className="w-5 h-5 mr-2" />
                {t('labels.samplePages')}
              </CardTitle>
              <CardDescription>
                {t('labels.samplePagesDescription')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row flex-wrap gap-4">
                {samplePages.map((pageUrl: any, index: number) => (
                  <div key={index} className="group cursor-pointer">
                    <div className="w-36 h-42 overflow-hidden rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                      <img
                        src={pageUrl.thumb}
                        alt={`Page ${index + 1} of ${book.title}`}
                        className="w-36 h-42 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Hide broken images
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
    )
}