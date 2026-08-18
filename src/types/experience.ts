export interface TasteExperience {
  slug: string;
  nome_ristorante: string;
  tagline?: string;
  logo_url?: string;
  cover_image?: string;
  brand_color: string;
  google_maps_url?: string;
  booking_url?: string;
  phone_number?: string;
  address?: string;
  nexus_bot_id?: string;
  owner_name?: string;
  owner_email?: string;
  google_rating?: number;
  google_reviews_count?: number;
  font_style?: string;
  bg_style?: string;
  button_style?: string;
  is_paid?: boolean;
  vibe_videos?: {
    id: string;
    title: string;
    video_url: string;
    thumb_url?: string;
  }[];
  is_active: boolean;
}

export interface MenuItem {
  id: string;
  experience_slug: string;
  categoria: string;
  nome_piatto: string;
  prezzo: number;
  descrizione?: string;
  foto_url?: string;
  allergeni?: string[];
  occasioni?: string[];
  storytelling?: string;
  pairing_vino?: string;
}
