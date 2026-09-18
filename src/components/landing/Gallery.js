"use client";
import { useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { X, ZoomIn } from "lucide-react";

// Hosted on Cloudinary (Websites/Wisdom Library Gallery folder — see
// backend/scripts/uploadGalleryImages.js) rather than served from /public via
// Next's Image Optimization API: that pipeline works in local dev but the
// deployed images 404'd on Vercel, so plain <img> tags against a CDN URL
// side-step it entirely. f_auto,q_auto lets Cloudinary pick the best
// format/quality per requesting browser.
const GALLERY_ITEMS = [
  {
    id: 1,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729681/Websites/Wisdom%20Library%20Gallery/wisdom-library-storefront.jpg",
    title: "Wisdom Library",
    subtitle: "Fully AC · Open 24×7",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729683/Websites/Wisdom%20Library%20Gallery/welcome-entrance.jpg",
    title: "Welcome Entrance",
    subtitle: "Raja Bagicha, Rafiganj",
    span: "col-span-1 row-span-2",
  },
  {
    id: 3,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729684/Websites/Wisdom%20Library%20Gallery/reading-hall.jpg",
    title: "Reading Hall",
    subtitle: "Silence & Focus",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729686/Websites/Wisdom%20Library%20Gallery/study-cubicles.jpg",
    title: "Study Cubicles",
    subtitle: "Individual Light & Socket",
    span: "col-span-1 row-span-1",
  },
  {
    id: 5,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729688/Websites/Wisdom%20Library%20Gallery/reception-desk.jpg",
    title: "Reception Desk",
    subtitle: "Always Here to Help",
    span: "col-span-1 row-span-2",
  },
  {
    id: 6,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729689/Websites/Wisdom%20Library%20Gallery/spacious-seating.jpg",
    title: "Spacious Seating",
    subtitle: "Room to Focus",
    span: "col-span-2 row-span-1",
  },
  {
    id: 7,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729695/Websites/Wisdom%20Library%20Gallery/comfort-and-focus.jpg",
    title: "Comfort & Focus",
    subtitle: "Fully Air Conditioned",
    span: "col-span-1 row-span-1",
  },
  {
    id: 8,
    src: "https://res.cloudinary.com/plpnaehl/image/upload/f_auto,q_auto/v1789729697/Websites/Wisdom%20Library%20Gallery/private-study-booths.jpg",
    title: "Private Study Booths",
    subtitle: "Distraction-Free Corners",
    span: "col-span-1 row-span-1",
  },
];

function GalleryCard({ item, index, onOpen }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-30px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`${item.span} relative overflow-hidden rounded-2xl cursor-pointer group min-h-[160px]`}
      onClick={() => onOpen(item)}
    >
      <img
        src={item.src}
        alt={item.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Overlay on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        <div className="text-white font-semibold text-sm">{item.title}</div>
        <div className="text-white/60 text-xs">{item.subtitle}</div>
      </div>

      {/* Zoom icon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ZoomIn className="w-8 h-8 text-white drop-shadow-lg" />
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [selected, setSelected] = useState(null);
  const titleRef = useRef(null);
  const titleInView = useInView(titleRef, { once: true });

  return (
    <section id="gallery" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={titleRef}
          initial={{ opacity: 0, y: 30 }}
          animate={titleInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-bold tracking-widest uppercase mb-4">
            Photo Gallery
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-primary mb-4">
            A Glimpse Inside
            <span className="gradient-text-primary block">Wisdom Library</span>
          </h2>
          <p className="text-primary-lighter max-w-xl mx-auto">
            Spaces crafted for concentration, comfort, and community — see what
            makes us special.
          </p>
        </motion.div>

        {/* Masonry-style grid */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 [grid-auto-flow:dense]"
          style={{ gridAutoRows: "160px" }}
        >
          {GALLERY_ITEMS.map((item, i) => (
            <GalleryCard
              key={item.id}
              item={item}
              index={i}
              onOpen={setSelected}
            />
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="relative max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-80 bg-primary-100">
                <img
                  src={selected.src}
                  alt={selected.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              <div className="bg-white p-6">
                <h3 className="font-display font-bold text-primary text-xl">
                  {selected.title}
                </h3>
                <p className="text-primary-lighter mt-1">{selected.subtitle}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <X size={18} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
