'use client';

import { useEffect } from 'react';

interface NexusWidgetProps {
  botId: string;
  brandColor?: string;
}

export default function NexusWidget({ botId }: NexusWidgetProps) {
  useEffect(() => {
    // Evita duplicati dello script
    if (document.getElementById('nexus-widget-script')) return;

    const script = document.createElement('script');
    script.id = 'nexus-widget-script';
    script.src = 'https://nexus.rmstudio.app/widget.js'; // o endpoint widget Nexus
    script.async = true;
    script.setAttribute('data-bot-id', botId);
    document.body.appendChild(script);

    return () => {
      const existingScript = document.getElementById('nexus-widget-script');
      if (existingScript) existingScript.remove();
    };
  }, [botId]);

  return null; // Il widget si posiziona fluttuante in basso a destra
}
