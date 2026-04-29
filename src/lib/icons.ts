import {
  Code2, Smartphone, Share2, Camera, Palette, Sparkles, Briefcase, BookOpen, Users, BarChart3,
  Wrench, Calendar, Layers, Zap, Star, Heart, Globe, Image as ImageIcon, Pen, Video,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const map: Record<string, LucideIcon> = {
  Code2, Smartphone, Share2, Camera, Palette, Sparkles, Briefcase, BookOpen, Users, BarChart3,
  Wrench, Calendar, Layers, Zap, Star, Heart, Globe, Image: ImageIcon, Pen, Video,
};

export const getIcon = (name: string): LucideIcon => map[name] ?? Sparkles;
