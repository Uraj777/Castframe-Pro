import React, { useState } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Download, 
  RotateCcw 
} from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  imageUrl,
  title,
  subtitle,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.35, 2.5));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.7));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  return (
    <div 
      id="image-lightbox-modal"
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between select-none animate-fade-in"
      onClick={onClose}
    >
      {/* Top Bar */}
      <div 
        className="p-4 bg-black/60 border-b border-white/10 flex items-center justify-between text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="text-sm font-bold tracking-wide">{title}</h3>
          {subtitle && (
            <p className="text-xs text-amber-300 font-mono mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#191e28] border border-white/10 rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-[#9aa7b9] hover:text-white rounded hover:bg-[#252c3c]"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-xs font-mono text-[#aeb9cb] hover:text-white"
              title="Reset zoom"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-[#9aa7b9] hover:text-white rounded hover:bg-[#252c3c]"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <a
            href={imageUrl}
            download="CastFrame_Export.jpg"
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded bg-[#191e28] hover:bg-[#252c3c] text-white border border-white/10 transition-colors"
            title="Download full resolution"
          >
            <Download className="w-4 h-4" />
          </a>

          <button
            onClick={onClose}
            className="p-2 rounded bg-[#191e28] hover:bg-rose-500/20 text-white hover:text-rose-300 border border-white/10 transition-colors ml-2"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Container */}
      <div 
        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title}
          style={{ transform: `scale(${zoomLevel})` }}
          className="max-h-[82vh] max-w-[90vw] object-contain transition-transform duration-200 shadow-2xl rounded-sm"
        />
      </div>

      {/* Bottom Bar info */}
      <div 
        className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-[#788599]"
        onClick={(e) => e.stopPropagation()}
      >
        <span>CASTFRAME AI • IdentityMesh 35mm Master Raw</span>
        <span>Use zoom controls or double-click to evaluate high-frequency facial pores and specular highlights</span>
      </div>
    </div>
  );
};
