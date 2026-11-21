const FormatTime = (timestamp) => {
  if (timestamp == null || timestamp === '') return '';

  // Accept common inputs:
  // - number (ms since epoch)
  // - Date
  // - string: "YYYY-MM-DD HH:mm:ss" or any Date-parsable string
  try {
    if (typeof timestamp === 'number') {
      const d = new Date(timestamp);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (timestamp instanceof Date) {
      if (Number.isNaN(timestamp.getTime())) return '';
      return timestamp.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    if (typeof timestamp === 'string') {
      // "YYYY-MM-DD HH:mm:ss"
      if (timestamp.includes(' ') && timestamp.includes(':')) {
        const parts = timestamp.split(' ');
        const timePart = parts[1] || '';
        const [hours, minutes] = timePart.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        if (Number.isNaN(h) || Number.isNaN(m)) return '';
        const date = new Date();
        date.setHours(h);
        date.setMinutes(m);
        return date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }

      // fallback: let Date parse it
      const d = new Date(timestamp);
      if (Number.isNaN(d.getTime())) return '';
      return d.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    }

    return '';
  } catch {
    return '';
  }
};

export default FormatTime;
