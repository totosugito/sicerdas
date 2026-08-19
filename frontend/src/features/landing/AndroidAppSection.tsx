import { motion, AnimatePresence } from "framer-motion";
import { Smartphone, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useEffect, useState } from "react";
import { IoLogoGooglePlaystore, IoLogoYoutube } from "react-icons/io5";
import { APP_CONFIG } from "@/constants/config";

export function AndroidAppSection() {
  const { t } = useAppTranslation();

  const mockupImages = APP_CONFIG.app.androidImages || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const appFeatures = [
    t(($) => $.landing.androidApp.benefits.offline),
    t(($) => $.landing.androidApp.benefits.notifications),
    t(($) => $.landing.androidApp.benefits.performance),
    t(($) => $.landing.androidApp.benefits.sync),
    t(($) => $.landing.androidApp.benefits.exclusive),
  ];

  // Auto carousel with pause on user interaction
  useEffect(() => {
    if (!isAutoPlay || mockupImages.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockupImages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [isAutoPlay, mockupImages.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + mockupImages.length) % mockupImages.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % mockupImages.length);
  };

  return (
    <section className="py-8 md:py-12 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-muted/20">
      {/* Glow decorative orbs */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col justify-center"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3 border border-emerald-500/20 w-fit">
              <Smartphone className="h-3.5 w-3.5" />
              {t(($) => $.landing.androidApp.badge)}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-3">
              {t(($) => $.landing.androidApp.title)}
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 max-w-xl">
              {t(($) => $.landing.androidApp.description)}
            </p>

            {/* Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mb-6">
              {appFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.06 }}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-card/60 border border-border/60 backdrop-blur-xs"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-foreground">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                className="font-semibold gap-2 shadow-md shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary-hover transition-all cursor-pointer"
                onClick={() => {
                  window.open(APP_CONFIG.app.playStore, "_blank");
                }}
              >
                <IoLogoGooglePlaystore className="h-4 w-4" />
                <span>{t(($) => $.landing.androidApp.downloadButton)}</span>
              </Button>

              <Button
                variant="outline"
                className="font-semibold gap-2 bg-card/80 border-border/80 hover:bg-muted transition-all cursor-pointer"
                onClick={() => {
                  window.open(APP_CONFIG.app.youtubeDemo, "_blank");
                }}
              >
                <IoLogoYoutube className="h-4 w-4 text-red-500" />
                <span>{t(($) => $.landing.androidApp.watchDemo)}</span>
              </Button>
            </div>
          </motion.div>

          {/* Right Column: Phone Mockup Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col items-center justify-center relative"
          >
            {/* Phone Bezel */}
            <div className="relative w-[240px] sm:w-[270px] aspect-[9/19] rounded-[38px] bg-slate-900 dark:bg-slate-950 p-2.5 shadow-2xl ring-1 ring-white/20 dark:ring-white/10 shadow-primary/10">
              {/* Dynamic Island / Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-18 h-3.5 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800/80 mr-2.5" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
              </div>

              {/* Inner Screen Screen Frame */}
              <div className="w-full h-full rounded-[30px] overflow-hidden bg-background relative select-none">
                {mockupImages.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentIndex}
                      src={mockupImages[currentIndex]}
                      alt={`App preview screen ${currentIndex + 1}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="w-full h-full object-cover object-top"
                    />
                  </AnimatePresence>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    Preview App
                  </div>
                )}

                {/* Subtle glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
              </div>

              {/* Prev / Next controls */}
              {mockupImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    aria-label="Previous screenshot"
                    className="absolute -left-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-card transition-all cursor-pointer z-30"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Next screenshot"
                    className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-card/90 border border-border shadow-md flex items-center justify-center text-foreground hover:bg-card transition-all cursor-pointer z-30"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Pagination Dots */}
            {mockupImages.length > 1 && (
              <div className="flex items-center gap-1.5 mt-4">
                {mockupImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlay(false);
                      setCurrentIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? "w-6 bg-primary"
                        : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    }`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}