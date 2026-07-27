'use client';

interface VibeVideo {
  id: string;
  title: string;
  video_url: string;
  thumb_url?: string;
}

interface VibeGridProps {
  videos: VibeVideo[];
}

export default function VibeGrid({ videos }: VibeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {videos.map((vid) => (
        <div
          key={vid.id}
          className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/10 group cursor-pointer"
        >
          <video
            src={vid.video_url}
            poster={vid.thumb_url}
            controls
            playsInline
            preload="metadata"
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <p className="text-xs font-bold text-white truncate">{vid.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
