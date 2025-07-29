import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, PencilBrush, Triangle } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mouse, 
  Pencil, 
  Square, 
  Circle as CircleIcon, 
  Triangle as TriangleIcon,
  Download, 
  Trash2, 
  Palette 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DrawSection = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [activeColor, setActiveColor] = useState("#10b981"); // Primary green
  const [activeTool, setActiveTool] = useState<"select" | "draw" | "rectangle" | "circle" | "triangle">("select");
  const [brushSize, setBrushSize] = useState(3);

  const colors = [
    "#10b981", // Primary green
    "#f59e0b", // Accent orange
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#000000", // Black
    "#6b7280", // Gray
  ];

  const tools = [
    { id: "select", icon: Mouse, label: "Select", color: "text-foreground" },
    { id: "draw", icon: Pencil, label: "Draw", color: "text-primary" },
    { id: "rectangle", icon: Square, label: "Rectangle", color: "text-accent" },
    { id: "circle", icon: CircleIcon, label: "Circle", color: "text-accent" },
    { id: "triangle", icon: TriangleIcon, label: "Triangle", color: "text-accent" },
  ] as const;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 1000,
      height: 700,
      backgroundColor: "#ffffff",
    });

    // Initialize drawing brush
    const brush = new PencilBrush(canvas);
    brush.color = activeColor;
    brush.width = brushSize;
    canvas.freeDrawingBrush = brush;

    setFabricCanvas(canvas);
    toast("Canvas ready! Start creating!", {
      description: "Use the tools on the left to draw and create shapes"
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;

    fabricCanvas.isDrawingMode = activeTool === "draw";
    
    if (activeTool === "draw" && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = activeColor;
      fabricCanvas.freeDrawingBrush.width = brushSize;
    }
  }, [activeTool, activeColor, brushSize, fabricCanvas]);

  const handleToolClick = (tool: typeof activeTool) => {
    setActiveTool(tool);

    if (!fabricCanvas) return;

    if (tool === "rectangle") {
      const rect = new Rect({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 120,
        height: 80,
        rx: 8,
        ry: 8,
      });
      fabricCanvas.add(rect);
      fabricCanvas.setActiveObject(rect);
    } else if (tool === "circle") {
      const circle = new Circle({
        left: 100,
        top: 100,
        fill: activeColor,
        radius: 50,
      });
      fabricCanvas.add(circle);
      fabricCanvas.setActiveObject(circle);
    } else if (tool === "triangle") {
      const triangle = new Triangle({
        left: 100,
        top: 100,
        fill: activeColor,
        width: 100,
        height: 100,
      });
      fabricCanvas.add(triangle);
      fabricCanvas.setActiveObject(triangle);
    }
  };

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#ffffff";
    fabricCanvas.renderAll();
    toast("Canvas cleared!", {
      description: "Your canvas is now ready for new creations"
    });
  };

  const handleDownload = () => {
    if (!fabricCanvas) return;
    
    const dataURL = fabricCanvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 2, // Higher resolution
    });
    
    const link = document.createElement('a');
    link.download = `earth-drawing-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("Drawing downloaded!", {
      description: "Your masterpiece has been saved to your device"
    });
  };

  return (
    <div className="h-full p-6 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="flex gap-6 h-full">
        {/* Toolbar */}
        <Card className="w-80 p-6 bg-card/80 backdrop-blur-sm border-border/50">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">Draw</h2>
              <p className="text-sm text-muted-foreground">
                Create beautiful drawings and diagrams
              </p>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Tools
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTool === tool.id;
                  
                  return (
                    <Button
                      key={tool.id}
                      variant={isActive ? "default" : "ghost"}
                      onClick={() => handleToolClick(tool.id)}
                      className={cn(
                        "h-12 flex flex-col gap-1 transition-all duration-200",
                        isActive && "bg-primary text-primary-foreground shadow-soft scale-105"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="font-semibold text-foreground mb-3">Colors</h3>
              <div className="grid grid-cols-4 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    className={cn(
                      "w-10 h-10 rounded-lg border-2 transition-all duration-200",
                      "hover:scale-110 hover:shadow-lg",
                      activeColor === color 
                        ? "border-foreground shadow-lg scale-110" 
                        : "border-border"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Brush Size */}
            {activeTool === "draw" && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Brush Size</h3>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1px</span>
                    <Badge variant="secondary">{brushSize}px</Badge>
                    <span>20px</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-4 border-t border-border">
              <Button
                onClick={handleDownload}
                className="w-full bg-gradient-to-r from-primary to-primary-glow"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={handleClear}
                className="w-full hover:bg-destructive/10 hover:border-destructive/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Canvas
              </Button>
            </div>
          </div>
        </Card>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center">
          <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-xl">
            <canvas 
              ref={canvasRef} 
              className="rounded-lg shadow-inner border border-border/20" 
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DrawSection;